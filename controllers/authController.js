const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get current user
exports.getCurrentUser = async (req, res) => {
    const user_id = req.user.id; // Extract user ID from auth middleware

    try {
        const query = 'SELECT * FROM user WHERE id = ?';
        const [results] = await db.query(query, [user_id]);

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove password from response
        delete results[0].password;
        res.json({data: results[0]});

    } catch (err) {
        console.error('Error fetching current user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register Endpoint
exports.register = async (req, res) => {
    const { first_name, last_name, username, password, confirmPassword } = req.body;

    try {
        // Input validation
        if (!first_name || !last_name || !username || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Please fill all fields!' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        // Check if username exists
        const query = 'SELECT * FROM user WHERE username = ?';
        const [results] = await db.query(query, [username]);

        if (results.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const insertQuery = `
        INSERT 
        INTO user 
        (
        first_name, 
        last_name, 
        username, 
        password, 
        created_at
        ) 
        VALUES (?, ?, ?, ?, NOW())`;
        await db.query(insertQuery, [first_name, last_name, username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully.' });

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Server error while registering user.' });
    }
};

// Login Endpoint
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password.' });
        }

        const query = 'SELECT * FROM user WHERE username = ?';
        const [results] = await db.query(query, [username]);

        if (results.length === 0) {
            return res.status(409).json({ message: 'Username not found.' });
        }

        const user = results[0]; // Corrected: use the first result (user)

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong Password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Save user_id to session
        req.session.user = { id: user.id, username: user.username };

        // Save session asynchronously
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Error saving session.' });
            }

            // Store JWT in a secure cookie
            res.cookie('propers_sid', token, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'none',
                path: '/',
            });

            res.status(200).json({ message: 'Login successful.'});
        });
        

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Server error while logging in.' });
    }
};

// Logout Endpoint
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out.' });
        }

        res.clearCookie('propers_sid', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        res.status(200).json({ message: 'Logged out successfully.' });
    });
};
