const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear/connectar a la BD
const db = new sqlite3.Database(path.join(__dirname, 'darkweb.db'), (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Taula de ARMES
  db.run(`
    CREATE TABLE IF NOT EXISTS weapons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      size TEXT,
      bullet_type TEXT,
      price REAL,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Taula de DROGUES
  db.run(`
    CREATE TABLE IF NOT EXISTS drugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      price_per_gram REAL,
      max_grams INTEGER,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Taula d'ÒRGANS
  db.run(`
    CREATE TABLE IF NOT EXISTS organs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER,
      weight REAL,
      health_status TEXT,
      image TEXT,
      price REAL,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Taula de CARRET
  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL,
      unit_price REAL,
      total_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserir dades de prova
  insertSampleData();
}

function insertSampleData() {
  // Comprovar si ja hi ha dades
  db.get("SELECT COUNT(*) as count FROM weapons", (err, row) => {
    if (err || !row) {
      console.error('Error checking data:', err);
      return;
    }
    
    if (row.count === 0) {
      // ARMES
      db.run("INSERT INTO weapons (name, image, size, bullet_type, price, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["AK-47", "rifle1.jpg", "7.62mm", "7.62x39", 1500, 10]);
      db.run("INSERT INTO weapons (name, image, size, bullet_type, price, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["Glock 19", "handgun1.jpg", "9mm", "9x19mm", 600, 20]);
      db.run("INSERT INTO weapons (name, image, size, bullet_type, price, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["Sniper M40", "sniper1.jpg", "7.62mm", ".308 Winchester", 3000, 5]);

      // DROGUES
      db.run("INSERT INTO drugs (name, description, image, price_per_gram, max_grams, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["Cocaine", "Premium quality", "drug1.jpg", 80, 1000, 100]);
      db.run("INSERT INTO drugs (name, description, image, price_per_gram, max_grams, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["MDMA", "High purity", "drug2.jpg", 120, 500, 50]);
      db.run("INSERT INTO drugs (name, description, image, price_per_gram, max_grams, stock) VALUES (?, ?, ?, ?, ?, ?)", 
        ["Heroin", "Grade A", "drug3.jpg", 150, 2000, 80]);

      // ÒRGANS
      db.run("INSERT INTO organs (name, quantity, weight, health_status, image, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        ["Heart", 1, 0.3, "Excellent", "organ1.jpg", 50000, 2]);
      db.run("INSERT INTO organs (name, quantity, weight, health_status, image, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        ["Kidney", 2, 0.15, "Good", "organ2.jpg", 15000, 5]);
      db.run("INSERT INTO organs (name, quantity, weight, health_status, image, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        ["Liver", 1, 1.5, "Good", "organ3.jpg", 30000, 3]);
    }
  });
}

module.exports = db;
