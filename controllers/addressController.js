const db = require('../config/db'); // Make sure this is using the promise pool

exports.getProvence = async (req, res) => {
  const query = 'SELECT * FROM provence';
  try {
    const [results] = await db.query(query); // Await the promise-based query result
    res.json(results); // Send the results as a response
  } catch (err) {
    console.error('Error fetching provence:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDistrict = async (req, res) => {
  const { provence } = req.query;
  const query = 'SELECT * FROM district WHERE provence_id = ?';
  try {
    const [results] = await db.query(query, [provence]); // Await the query result
    res.json(results); // Send the results back as a response
  } catch (err) {
    console.error('Error fetching district:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSubdistrict = async (req, res) => {
  const { district } = req.query;
  const query = 'SELECT * FROM subdistrict WHERE district_id = ?';
  try {
    const [results] = await db.query(query, [district]); // Await the query result
    res.json(results); // Send the results back as a response
  } catch (err) {
    console.error('Error fetching subdistrict:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getVillage = async (req, res) => {
  const { subdistrict } = req.query;
  const query = 'SELECT * FROM village WHERE subdistrict_id = ?';
  try {
    const [results] = await db.query(query, [subdistrict]); // Await the query result
    res.json(results); // Send the results back as a response
  } catch (err) {
    console.error('Error fetching village:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
