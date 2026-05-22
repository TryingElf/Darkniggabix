const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== WEAPONS ====================
// GET /api/products/weapons - Llistar armes
router.get('/weapons', (req, res) => {
  db.all('SELECT * FROM weapons', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST /api/products/weapons - Afegir arma
router.post('/weapons', (req, res) => {
  const { name, image, size, bullet_type, price, stock } = req.body;
  db.run(
    'INSERT INTO weapons (name, image, size, bullet_type, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, image, size, bullet_type, price, stock],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, image, size, bullet_type, price, stock });
      }
    }
  );
});

// DELETE /api/products/weapons/:id - Eliminar arma
router.delete('/weapons/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM weapons WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Weapon deleted', id });
    }
  });
});

// ==================== DRUGS ====================
// GET /api/products/drugs - Llistar drogues
router.get('/drugs', (req, res) => {
  db.all('SELECT * FROM drugs', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST /api/products/drugs - Afegir droga
router.post('/drugs', (req, res) => {
  const { name, description, image, price_per_gram, max_grams, stock } = req.body;
  db.run(
    'INSERT INTO drugs (name, description, image, price_per_gram, max_grams, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, image, price_per_gram, max_grams, stock],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, description, image, price_per_gram, max_grams, stock });
      }
    }
  );
});

// DELETE /api/products/drugs/:id - Eliminar droga
router.delete('/drugs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM drugs WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Drug deleted', id });
    }
  });
});

// ==================== ORGANS ====================
// GET /api/products/organs - Llistar òrgans
router.get('/organs', (req, res) => {
  db.all('SELECT * FROM organs', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST /api/products/organs - Afegir òrgan
router.post('/organs', (req, res) => {
  const { name, quantity, weight, health_status, image, price, stock } = req.body;
  db.run(
    'INSERT INTO organs (name, quantity, weight, health_status, image, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, quantity, weight, health_status, image, price, stock],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, quantity, weight, health_status, image, price, stock });
      }
    }
  );
});

// DELETE /api/products/organs/:id - Eliminar òrgan
router.delete('/organs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM organs WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Organ deleted', id });
    }
  });
});

// ==================== CART ====================
// GET /api/products/cart - Llistar carret
router.get('/cart', (req, res) => {
  db.all('SELECT * FROM cart ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST /api/products/cart - Afegir al carret
router.post('/cart', (req, res) => {
  const { category, product_id, product_name, quantity, unit_price } = req.body;
  const total_price = quantity * unit_price;
  
  db.run(
    'INSERT INTO cart (category, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
    [category, product_id, product_name, quantity, unit_price, total_price],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, category, product_id, product_name, quantity, unit_price, total_price });
      }
    }
  );
});

// DELETE /api/products/cart/:id - Eliminar del carret
router.delete('/cart/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cart WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Item removed from cart', id });
    }
  });
});

// DELETE /api/products/cart - Netejar carret
router.delete('/cart', (req, res) => {
  db.run('DELETE FROM cart', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Cart cleared' });
    }
  });
});

module.exports = router;
