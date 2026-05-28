const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== WEAPONS ====================
router.get('/weapons', (req, res) => {
  db.all('SELECT * FROM weapons', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/weapons', (req, res) => {
  const { name, image, size, bullet_type, price, stock } = req.body;
  if (!name || !size || !bullet_type || price == null || stock == null) {
    return res.status(400).json({ error: 'Camps obligatoris: name, size, bullet_type, price, stock' });
  }
  db.run(
    'INSERT INTO weapons (name, image, size, bullet_type, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, image || null, size, bullet_type, price, stock],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, image: image || null, size, bullet_type, price, stock });
    }
  );
});

router.delete('/weapons/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM weapons WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Weapon not found' });
    res.json({ message: 'Weapon deleted', id });
  });
});

// ==================== DRUGS ====================
router.get('/drugs', (req, res) => {
  db.all('SELECT * FROM drugs', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/drugs', (req, res) => {
  const { name, description, image, price_per_gram, max_grams, stock } = req.body;
  if (!name || price_per_gram == null || max_grams == null || stock == null) {
    return res.status(400).json({ error: 'Camps obligatoris: name, price_per_gram, max_grams, stock' });
  }
  db.run(
    'INSERT INTO drugs (name, description, image, price_per_gram, max_grams, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || null, image || null, price_per_gram, max_grams, stock],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, description: description || null, image: image || null, price_per_gram, max_grams, stock });
    }
  );
});

router.delete('/drugs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM drugs WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Drug not found' });
    res.json({ message: 'Drug deleted', id });
  });
});

// ==================== ORGANS ====================
router.get('/organs', (req, res) => {
  db.all('SELECT * FROM organs', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/organs', (req, res) => {
  const { name, quantity, weight, health_status, image, price, stock } = req.body;
  if (!name || !health_status || price == null || stock == null) {
    return res.status(400).json({ error: 'Camps obligatoris: name, health_status, price, stock' });
  }
  db.run(
    'INSERT INTO organs (name, quantity, weight, health_status, image, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, quantity || null, weight || null, health_status, image || null, price, stock],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, quantity: quantity || null, weight: weight || null, health_status, image: image || null, price, stock });
    }
  );
});

router.delete('/organs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM organs WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Organ not found' });
    res.json({ message: 'Organ deleted', id });
  });
});

// ==================== PATCH ====================
function patchProduct(table, allowed, req, res) {
  const fields = [], values = [];
  allowed.forEach(f => { if (req.body[f] !== undefined) { fields.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!fields.length) return res.status(400).json({ error: 'Res a actualitzar' });
  values.push(req.params.id);
  db.run(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id], (err, row) => res.json(row));
  });
}

router.patch('/weapons/:id', (req, res) => patchProduct('weapons', ['name','size','bullet_type','price','stock','image'], req, res));
router.patch('/drugs/:id',   (req, res) => patchProduct('drugs',   ['name','description','price_per_gram','max_grams','stock','image'], req, res));
router.patch('/organs/:id',  (req, res) => patchProduct('organs',  ['name','health_status','price','stock','weight','quantity','image'], req, res));

// ==================== ORDERS ====================
router.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items_json) })));
  });
});

// ==================== CART ====================
router.get('/cart', (req, res) => {
  db.all('SELECT * FROM cart ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/cart', (req, res) => {
  const { category, product_id, product_name, quantity, unit_price } = req.body;
  if (!category || !product_id || !product_name || quantity == null || unit_price == null) {
    return res.status(400).json({ error: 'Camps obligatoris: category, product_id, product_name, quantity, unit_price' });
  }
  const total_price = quantity * unit_price;

  if (category === 'organs') {
    db.run(
      'INSERT INTO cart (category, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
      [category, product_id, product_name, quantity, unit_price, total_price],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, category, product_id, product_name, quantity, unit_price, total_price });
      }
    );
  } else {
    db.get('SELECT * FROM cart WHERE category = ? AND product_id = ?', [category, product_id], (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newTotal = newQty * unit_price;
        db.run('UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?', [newQty, newTotal, existing.id], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: existing.id, category, product_id, product_name, quantity: newQty, unit_price, total_price: newTotal });
        });
      } else {
        db.run(
          'INSERT INTO cart (category, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
          [category, product_id, product_name, quantity, unit_price, total_price],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, category, product_id, product_name, quantity, unit_price, total_price });
          }
        );
      }
    });
  }
});

router.delete('/cart/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cart WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item eliminat', id });
  });
});

router.delete('/cart', (req, res) => {
  db.run('DELETE FROM cart', function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Carrito buidat' });
  });
});

// ==================== ORDER ====================
router.post('/order', (req, res) => {
  db.all('SELECT * FROM cart', (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!items.length) return res.status(400).json({ error: 'El carrito és buit' });

    let pending = items.length;
    const errors = [];

    const finish = () => {
      if (errors.length > 0) return res.status(400).json({ errors });

      let updatePending = items.length;
      items.forEach(item => {
        db.run(`UPDATE ${item.category} SET stock = stock - ? WHERE id = ?`, [item.quantity, item.product_id], () => {
          updatePending--;
          if (updatePending === 0) {
            db.run('DELETE FROM cart', () => {
              const total = items.reduce((s, i) => s + i.total_price, 0);
              const ref = 'DNB-' + Date.now().toString(36).toUpperCase();
              db.run('INSERT INTO orders (ref, total, items_json) VALUES (?, ?, ?)',
                [ref, total, JSON.stringify(items)],
                () => res.status(201).json({ ref, items, total })
              );
            });
          }
        });
      });
    };

    items.forEach(item => {
      db.get(`SELECT stock FROM ${item.category} WHERE id = ?`, [item.product_id], (err, row) => {
        if (err || !row) {
          errors.push(`${item.product_name}: producte no trobat`);
        } else if (row.stock < item.quantity) {
          errors.push(`${item.product_name}: estoc insuficient (disponible: ${row.stock})`);
        }
        pending--;
        if (pending === 0) finish();
      });
    });
  });
});

module.exports = router;
