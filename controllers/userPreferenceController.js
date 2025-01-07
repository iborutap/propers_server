const db = require('../config/db');

// Check profile completeness and return current preferences
exports.Completeness = async (req, res) => {
    const user_id = req.user.id; // Extract user ID from auth middleware
    console.log(user_id);
    
    const query = `
    SELECT 
      u.id AS user_id,
      u.first_name,
      u.last_name,
      p.name AS provence_name,
      d.name AS district_name,
      sd.name AS subdistrict_name,
      v.name AS village_name,
      up.street,
      pr.price_range AS price,
      ct.category_name AS category,
      up.mobile
    FROM 
      user u
    LEFT JOIN 
      user_preference up ON up.user_id = u.id
    LEFT JOIN 
      address a ON up.address_id = a.id
    LEFT JOIN 
      provence p ON a.provence_id = p.id
    LEFT JOIN 
      district d ON a.district_id = d.id
    LEFT JOIN 
      subdistrict sd ON a.subdistrict_id = sd.id
    LEFT JOIN 
      village v ON a.village_id = v.id
    LEFT JOIN 
      price pr ON up.price_id = pr.id
    LEFT JOIN 
      category ct ON up.category_id = ct.id
    WHERE 
      u.id = ?;
  `;

    try {
        // Execute query
        const [results] = await db.query(query, [user_id]);

        // Check if results exist and if it's not null or empty
        if (!results || results.length === 0 || !results[0].provence_name) {
            return res.status(404).json({ preference: null });
        }

        // Send results
        res.status(200).json({
            preference: results[0] // Access the first result as an object
        });

    } catch (error) {
        console.error('Error:', error); // Fix error variable name in catch block
        res.status(500).json({ message: 'Server error while fetching user data.' });
    }
};



// Save or update user preferences
exports.savePreference = async (req, res) => {
    const user_id = req.user.id; // Extract user ID from auth middleware
    console.log(user_id)

    const {
        provence,
        district,
        subdistrict,
        village,
        street,
        price,
        category,
        mobile
    } = req.body;

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
        const query = `INSERT INTO user_preference (user_id, address_id, price_id, category_id, mobile) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_id = ?, 
      address_id = ?,
      price_id = ?,
      category_id = ?,
      mobile = ?,
      street = ?
  `;

        await db.query(
            query,
            [
                user_id, address_id, price, category, mobile,
                user_id, address_id, price, category, mobile, street
            ]
        );
        res.status(200).json({ message: 'User Preference has been saved succesfully' });  // Return the result of the query (affected rows, etc.)


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error updating user preference.' });
    }
};
