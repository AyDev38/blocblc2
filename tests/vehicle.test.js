const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Utilisation de mysql2 avec promises pour une meilleure gestion des transactions
const app = express();

app.use(bodyParser.json());

// MySQL Connection (use a test database)
let db;
let testVehicleId;

beforeAll(async () => {
  db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HJndezo78ZDBJ',
    database: 'garage_db'
  });
  console.log('Connected to MySQL Test Database');
});

// Define routes for testing (simplified)
app.post('/api/vehicles', async (req, res) => {
  const { marque, modele, annee, client_id, plaque } = req.body;
  const sql = 'INSERT INTO vehicules (marque, modele, annee, client_id, plaque) VALUES (?, ?, ?, ?, ?)';
  try {
    const [result] = await db.query(sql, [marque, modele, annee, client_id, plaque]);
    res.status(201).send({ id: result.insertId, marque, modele, annee, client_id, plaque });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/vehicles', async (req, res) => {
  const sql = 'SELECT * FROM vehicules';
  try {
    const [results] = await db.query(sql);
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { marque, modele, annee, client_id, plaque } = req.body;
  const sql = 'UPDATE vehicules SET marque = ?, modele = ?, annee = ?, client_id = ?, plaque = ? WHERE id = ?';
  try {
    await db.query(sql, [marque, modele, annee, client_id, plaque, id]);
    res.status(200).send({ id: parseInt(id), marque, modele, annee, client_id, plaque });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM vehicules WHERE id = ?';
  try {
    await db.query(sql, [id]);
    res.status(200).send({ id: parseInt(id) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Tests
describe('API tests', () => {
  beforeEach(async () => {
    // Clear the table and insert a test vehicle
    await db.query('DELETE FROM vehicules');
    const [result] = await db.query('INSERT INTO vehicules (marque, modele, annee, client_id, plaque) VALUES ("TestMarque", "TestModele", 2022, 1, "TEST123")');
    testVehicleId = result.insertId;
  });

  test('POST /api/vehicles', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .send({
        marque: 'Peugeot',
        modele: '208',
        annee: 2019,
        client_id: 1,
        plaque: 'AB-123-CD'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      marque: 'Peugeot',
      modele: '208',
      annee: 2019,
      client_id: 1,
      plaque: 'AB-123-CD'
    });
  });

  test('GET /api/vehicles', async () => {
    const response = await request(app).get('/api/vehicles');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('PUT /api/vehicles/:id', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${testVehicleId}`)
      .send({
        marque: 'Peugeot',
        modele: '208',
        annee: 2019,
        client_id: 1,
        plaque: 'AB-123-CD'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: testVehicleId,
      marque: 'Peugeot',
      modele: '208',
      annee: 2019,
      client_id: 1,
      plaque: 'AB-123-CD'
    });
  });

  test('DELETE /api/vehicles/:id', async () => {
    const response = await request(app).delete(`/api/vehicles/${testVehicleId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ id: testVehicleId });

    const checkResponse = await request(app).get('/api/vehicles');
    expect(checkResponse.body).not.toContainEqual(expect.objectContaining({ id: testVehicleId }));
  });
});

// Close the MySQL connection
afterAll(async () => {
  await db.end();
  console.log('Disconnected from MySQL Test Database');
});
