const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../config/database');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let rowNumber = 0;

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        rowNumber++;
        try {
          const weldData = {
            date: data.DATE || data.date,
            type_fit: data['TYPE FIT'] || data.type_fit,
            wps: data.WPS || data.wps,
            pipe_dia: data['PIPE DIA'] || data.pipe_dia,
            grade_class: data['GRADE /CLASS'] || data.grade_class,
            weld_number: data['WELD #'] || data.weld_number,
            welder: data.WELDER || data.welder,
            first_ht_number: data['1st HT#'] || data.first_ht_number,
            first_length: data['1st Length'] || data.first_length,
            jt_number: data.JT || data.jt_number,
            second_ht_number: data['2nd HT#'] || data.second_ht_number,
            second_length: data['2nd Length'] || data.second_length,
            pre_heat: data['PRE HEAT'] || data.pre_heat,
            vt: data.VT || data.vt,
            process: data.Process || data.process,
            nde_number: data.NDE || data.nde_number,
            amps: data.Amps || data.amps,
            volts: data.Volts || data.volts,
            ipm: data.IPM || data.ipm
          };

          if (weldData.date) {
            results.push(weldData);
          }
        } catch (error) {
          errors.push({ row: rowNumber, error: error.message });
        }
      })
      .on('end', async () => {
        try {
          let successCount = 0;
          let errorCount = 0;

          for (const weld of results) {
            try {
              await pool.query(`
                INSERT INTO welds (
                  date, type_fit, wps, pipe_dia, grade_class, weld_number, welder,
                  first_ht_number, first_length, jt_number, second_ht_number, second_length,
                  pre_heat, vt, process, nde_number, amps, volts, ipm
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
              `, [
                weld.date, weld.type_fit, weld.wps, weld.pipe_dia, weld.grade_class,
                weld.weld_number, weld.welder, weld.first_ht_number, weld.first_length,
                weld.jt_number, weld.second_ht_number, weld.second_length, weld.pre_heat,
                weld.vt, weld.process, weld.nde_number, weld.amps, weld.volts, weld.ipm
              ]);
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push({ row: rowNumber, error: error.message });
            }
          }

          fs.unlinkSync(req.file.path);

          res.json({
            message: 'CSV import completed',
            totalRows: results.length,
            successCount,
            errorCount,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Failed to process CSV' });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let query = 'SELECT * FROM welds WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (date_from) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(date_from);
    }
    
    if (date_to) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(date_to);
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for export' });
    }
    
    const csvData = result.rows.map(row => ({
      DATE: row.date,
      'TYPE FIT': row.type_fit,
      WPS: row.wps,
      'PIPE DIA': row.pipe_dia,
      'GRADE /CLASS': row.grade_class,
      'WELD #': row.weld_number,
      WELDER: row.welder,
      '1st HT#': row.first_ht_number,
      '1st Length': row.first_length,
      JT: row.jt_number,
      '2nd HT#': row.second_ht_number,
      '2nd Length': row.second_length,
      'PRE HEAT': row.pre_heat,
      VT: row.vt,
      Process: row.process,
      NDE: row.nde_number,
      Amps: row.amps,
      Volts: row.volts,
      IPM: row.ipm
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=welding-data.csv');
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value || ''}"`).join(','))
    ].join('\n');
    
    res.send(csvString);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
