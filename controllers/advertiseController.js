const db = require('../config/db'); // Assuming db is your MySQL connection instance

exports.Advertise = async (req, res) => {
    const user_id = req.user.id; // Extract user ID from auth middleware

    const {
        product_name,
        product_desc,
        product_price,
        price,
        street,
        category,
        provence,
        district,
        subdistrict,
        village,
    } = req.body;

    // Input validation
    if (!provence || !district || !subdistrict || !village || !street || !price || !category) {
        return res.status(400).json({ message: 'Harap lengkapi semua data.' });
    }

    if (!/^[0-9]+$/.test(price)) {
        return res.status(400).json({ message: 'Nomor HP hanya boleh berisi angka.' });
    }

    try {
        // Function to check and save address if necessary
        const saveAddress = async () => {
            const checkQuery = `
                SELECT id FROM address 
                WHERE provence_id = ? 
                AND district_id = ? 
                AND subdistrict_id = ? 
                AND village_id = ?`;

            const [checkResults] = await db.query(checkQuery, [provence, district, subdistrict, village]);

            if (checkResults.length > 0) {
                return checkResults[0].id; // Address already exists, return ID
            }

            // If address doesn't exist, insert new one
            const insertQuery = `
                INSERT INTO address (provence_id, district_id, subdistrict_id, village_id) 
                VALUES (?, ?, ?, ?)`;

            const [newAddress] = await db.query(insertQuery, [provence, district, subdistrict, village]);
            return newAddress.insertId; // Return the inserted address ID
        };

        // Get or insert the address and get the address ID
        const address_id = await saveAddress();

        // Insert product details into the product table
        const query = `
            INSERT INTO product (
                user_id, 
                product_name, 
                product_desc, 
                product_price,  
                price_id, 
                address_id, 
                street, 
                category_id,
                created_at
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const [results] = await db.query(query, [
            user_id,
            product_name,
            product_desc,
            product_price,
            price,
            address_id,
            street,
            category,
        ]);

        res.status(200).json({
            message: 'Product has been published successfully.',
            productId: results.insertId, // Return the inserted product ID if needed
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server Error.' });
    }
};
