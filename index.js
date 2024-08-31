const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 8001;

const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the products database.');
});

app.use(express.json());

// Endpoints CRUD
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
    }
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (!row) {
      res.status(404).send('Product not found');
    } else {
      res.send(row);
    }
  });
});

app.post('/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    res.status(400).send('Name and price are required');
  } else {
    const sql = 'INSERT INTO products(name, price) VALUES (?, ?)';
    db.run(sql, [name, price], function(err) {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(201).send({ id: this.lastID, name, price });
      }
    });
  }
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
  db.run(sql, [name, price, id], function(err) {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('Product not found');
    } else {
      res.status(200).send({ id, name, price });
    }
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('Product not found');
    } else {
      res.status(204).send();
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});