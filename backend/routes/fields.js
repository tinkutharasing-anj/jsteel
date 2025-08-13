const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM field_definitions ORDER BY field_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fields:', error);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM field_definitions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching field:', error);
    res.status(500).json({ error: 'Failed to fetch field' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      field_name,
      display_name,
      field_type,
      is_required,
      is_editable,
      field_order,
      validation_rules
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO field_definitions (
        field_name, display_name, field_type, is_required, is_editable, field_order, validation_rules
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [field_name, display_name, field_type, is_required, is_editable, field_order, validation_rules]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating field:', error);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      field_name,
      display_name,
      field_type,
      is_required,
      is_editable,
      field_order,
      validation_rules
    } = req.body;
    
    const result = await pool.query(`
      UPDATE field_definitions SET
        field_name = $1, display_name = $2, field_type = $3, is_required = $4,
        is_editable = $5, field_order = $6, validation_rules = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [field_name, display_name, field_type, is_required, is_editable, field_order, validation_rules, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({ error: 'Failed to update field' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM field_definitions WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error('Error deleting field:', error);
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

router.put('/reorder', async (req, res) => {
  try {
    const { fieldOrders } = req.body;
    
    for (const field of fieldOrders) {
      await pool.query(
        'UPDATE field_definitions SET field_order = $1 WHERE id = $2',
        [field.order, field.id]
      );
    }
    
    res.json({ message: 'Fields reordered successfully' });
  } catch (error) {
    console.error('Error reordering fields:', error);
    res.status(500).json({ error: 'Failed to reorder fields' });
  }
});

module.exports = router;
