require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;
const cookieParser = require('cookie-parser');

// Create MySQL session store
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    clearExpired: true, // Clear expired sessions automatically
    checkExpirationInterval: 900000, // 15 minutes to check expired sessions
    expiration: 86400000 // 24 hours session expiry
});

const allowedOrigins = [
    'https://localhost:3000',               // Development
    'https://propers.iborutap.com'         // Production
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        key: 'propers_sid', // Custom cookie key name
        secret: process.env.SESSION_SECRET, // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
        store: sessionStore, // Use MySQL session store
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'none', // Cross-domain cookies
            maxAge: 24 * 60 * 60 * 1000 // 24 hours expiration
        }
    })
);

app.get('/', (req, res) => res.send('Server (Express.js) Work on Vercel'))

const authController = require('./controllers/authController')
const auth = require('./middleware/authMiddleware')
app.get('/api/auth/me', auth.authenticate, authController.getCurrentUser);

app.post('/api/auth/register', authController.register)
app.post('/api/auth/login', authController.login)
app.post('/api/auth/logout', authController.logout)

const addressController = require('./controllers/addressController')
app.get('/api/locations/provence', addressController.getProvence)
app.get('/api/locations/district', addressController.getDistrict)
app.get('/api/locations/subdistrict', addressController.getSubdistrict)
app.get('/api/locations/village', addressController.getVillage)

const preferenceController = require('./controllers/preferenceController')
app.get('/api/preference/price', preferenceController.getPrice)
app.get('/api/preference/category', preferenceController.getCategory)

const userPreference = require('./controllers/userPreferenceController')
app.post('/api/profile/preference', auth.authenticate, userPreference.savePreference);
app.get('/api/profile', auth.authenticate, userPreference.Completeness)

const advertise = require('./controllers/advertiseController');
app.post('/api/advertise', auth.authenticate, advertise.Advertise)

const product = require('./controllers/productController')
app.get('/api/product/tanah', product.getTanah)

const sendEmail = require('./controllers/emailController')
app.post('/api/send-email', sendEmail.sendEmail)

app.get('/api/search', product.getProduct)

app.get('/api/recommended-properties', auth.authenticate, product.recommendedProduct)

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// const serverless = require('serverless-http');
module.exports = app;


