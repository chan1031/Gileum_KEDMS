const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gravity9.8123!',
  database: 'kindergarten'
});

db.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/styles', express.static(__dirname + '/public/styles'));
// Routes
app.post('/submit', (req, res) => {
  const { name, class: class_, expected_departure_time } = req.body;
  const query = 'INSERT INTO attendance (name, class, expected_departure_time) VALUES (?, ?, ?)';

  db.query(query, [name, class_, expected_departure_time], (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/admin', (req, res) => {
  const query = 'SELECT * FROM attendance ORDER BY arrival_time DESC';

  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// New endpoint to get members who have not yet arrived
app.get('/not_arrived', (req, res) => {
  const query = `
    SELECT m.name, m.class, m.parent_phone
    FROM member m
    LEFT JOIN attendance a ON m.name = a.name
    WHERE a.arrival_time IS NULL OR a.arrival_time IS NULL
  `;

  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});