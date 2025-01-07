const db = require('../config/db')

exports.getPrice = async (req, res) => {
    const query = 'SELECT * FROM price';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching price:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getCategory = async (req, res) => {
    const query = 'SELECT * FROM category';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching category:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
