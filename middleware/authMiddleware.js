const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const token = req.cookies.propers_sid; // Read token from cookie

    if (!token) {
        console.log('token gakebaca')
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        console.log(decoded)
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};
