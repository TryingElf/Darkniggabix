const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/encarrecs
router.get('/', (req, res) => {
  db.all('SELECT * FROM encarrecs ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/encarrecs
router.post('/', (req, res) => {
  const { producte, categoria, quantitat, email, pressupost, notes } = req.body;
  if (!producte || !categoria || quantitat == null || !email) {
    return res.status(400).json({ error: 'Camps obligatoris: producte, categoria, quantitat, email' });
  }
  if (!['weapons', 'drugs', 'organs'].includes(categoria)) {
    return res.status(400).json({ error: 'Categoria invàlida' });
  }
  if (quantitat < 1) {
    return res.status(400).json({ error: 'La quantitat ha de ser almenys 1' });
  }
  db.run(
    'INSERT INTO encarrecs (producte, categoria, quantitat, email, pressupost, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [producte, categoria, quantitat, email, pressupost || null, notes || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID, producte, categoria, quantitat,
        email, pressupost: pressupost || null, notes: notes || null, estat: 'pendent'
      });
    }
  );
});

// PATCH /api/encarrecs/:id — actualitzar estat
const ESTATS_VALIDS = ['pendent', 'acceptat', 'en_gestio', 'enviat', 'tancat', 'rebutjat'];

router.patch('/:id', (req, res) => {
  const { estat } = req.body;
  if (!estat || !ESTATS_VALIDS.includes(estat)) {
    return res.status(400).json({ error: `Estat invàlid. Valors permesos: ${ESTATS_VALIDS.join(', ')}` });
  }
  db.run('UPDATE encarrecs SET estat = ? WHERE id = ?', [estat, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Encàrrec no trobat' });
    res.json({ id: req.params.id, estat });
  });
});

// DELETE /api/encarrecs/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM encarrecs WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Encàrrec no trobat' });
    res.json({ message: 'Encàrrec eliminat', id: req.params.id });
  });
});

module.exports = router;
