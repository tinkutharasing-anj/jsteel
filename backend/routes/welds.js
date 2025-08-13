const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'weld-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      imagePath: imagePath,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM welds WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (weld_number ILIKE $${paramCount} OR welder ILIKE $${paramCount} OR type_fit ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
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
    
    query += ` ORDER BY date DESC, created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching welds:', error);
    res.status(500).json({ error: 'Failed to fetch welds' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM welds WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weld not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching weld:', error);
    res.status(500).json({ error: 'Failed to fetch weld' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      date, type_fit, wps, pipe_dia, grade_class, weld_number, welder,
      first_ht_number, first_length, jt_number, second_ht_number, second_length,
      pre_heat, vt, process, nde_number, amps, volts, ipm, custom_fields, image_path
    } = req.body;
    
    console.log('Create weld request body:', req.body);
    
    // Handle null/undefined values for optional fields
    const insertData = [
      date || null,
      type_fit || null,
      wps || null,
      pipe_dia || null,
      grade_class || null,
      weld_number || null,
      welder || null,
      first_ht_number || null,
      first_length || null,
      jt_number || null,
      second_ht_number || null,
      second_length || null,
      pre_heat || null,
      vt || null,
      process || null,
      nde_number || null,
      amps || null,
      volts || null,
      ipm || null,
      custom_fields || null,
      image_path || null
    ];
    
    console.log('Insert data array:', insertData);
    
    const result = await pool.query(`
      INSERT INTO welds (
        date, type_fit, wps, pipe_dia, grade_class, weld_number, welder,
        first_ht_number, first_length, jt_number, second_ht_number, second_length,
        pre_heat, vt, process, nde_number, amps, volts, ipm, custom_fields, image_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, insertData);
    
    console.log('Create successful:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weld:', error);
    res.status(500).json({ error: 'Failed to create weld' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, type_fit, wps, pipe_dia, grade_class, weld_number, welder,
      first_ht_number, first_length, jt_number, second_ht_number, second_length,
      pre_heat, vt, process, nde_number, amps, volts, ipm, custom_fields, image_path
    } = req.body;
    
    console.log('Update weld request:', { id, body: req.body });
    
    // Handle null/undefined values for optional fields
    const updateData = [
      date || null,
      type_fit || null,
      wps || null,
      pipe_dia || null,
      grade_class || null,
      weld_number || null,
      welder || null,
      first_ht_number || null,
      first_length || null,
      jt_number || null,
      second_ht_number || null,
      second_length || null,
      pre_heat || null,
      vt || null,
      process || null,
      nde_number || null,
      amps || null,
      volts || null,
      ipm || null,
      custom_fields || null,
      image_path || null,
      id
    ];
    
    console.log('Update data array:', updateData);
    
    const result = await pool.query(`
      UPDATE welds SET
        date = $1, type_fit = $2, wps = $3, pipe_dia = $4, grade_class = $5,
        weld_number = $6, welder = $7, first_ht_number = $8, first_length = $9,
        jt_number = $10, second_ht_number = $11, second_length = $12,
        pre_heat = $13, vt = $14, process = $15, nde_number = $16,
        amps = $17, volts = $18, ipm = $19, custom_fields = $20, image_path = $21, updated_at = CURRENT_TIMESTAMP
      WHERE id = $22
      RETURNING *
    `, updateData);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weld not found' });
    }
    
    console.log('Update successful:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating weld:', error);
    res.status(500).json({ error: 'Failed to update weld' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM welds WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weld not found' });
    }
    
    res.json({ message: 'Weld deleted successfully' });
  } catch (error) {
    console.error('Error deleting weld:', error);
    res.status(500).json({ error: 'Failed to delete weld' });
  }
});

module.exports = router;
