const express = require('express'); // Tuodaan Express-kirjasto
const path = require('path'); // Tuodaan path-kirjasto tiedostopolkujen käsittelyyn
const cookieParser = require('cookie-parser'); // Tuodaan cookie-parser middleware evästeiden käsittelyyn
const session = require('express-session'); // Tuodaan express-session middleware sessioiden hallintaan
const morgan = require('morgan'); // Tuodaan morgan middleware HTTP-pyyntöjen lokitukseen
const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto ympäristömuuttujien hallintaan
const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken-kirjasto JWT-tunnisteiden luomiseen ja tarkistamiseen
const atmRouter = require('./routes/atm'); // Tuodaan ATM-reititin
const adminRouter = require('./routes/admin'); // Tuodaan admin-reititin
const userRouter = require('./routes/user'); // Tuodaan user-reititin
const accountRouter = require('./routes/account'); // Tuodaan account-reititin
const cardAccountRouter = require('./routes/card_account'); // Tuodaan card_account-reititin
const cardRouter = require('./routes/card'); // Tuodaan card-reititin
const transactionRouter = require('./routes/transaction'); // Tuodaan transaction-reititin
const cardLoginRouter = require('./routes/card_login'); // Tuodaan card_login-reititin
const adminLoginRouter = require('./routes/admin_login'); // Tuodaan admin_login-reititin
const { logRequests } = require('./logger'); // Tuodaan logRequests middleware pyyntöjen lokitukseen
const { verifyToken, restrictToAdmin } = require('./middleware/auth_middleware'); // Tuodaan autentikointimiddlewaret
const db = require('./database');  // Lisää tietokantayhteys
const { swaggerUi, specs } = require('./swagger'); // Lisätään takaisin swagger import

// Lisätään User-malli
const User = require('./models/user_model');
const Account = require('./models/account_model');

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta

const app = express(); // Luodaan uusi Express-sovellus

app.use(morgan('dev')); // Käytetään morgan-middlewarea HTTP-pyyntöjen lokitukseen
app.use(express.json()); // Käytetään express.json-middlewarea JSON-pyyntöjen käsittelyyn
app.use(express.urlencoded({ extended: false })); // Käytetään express.urlencoded-middlewarea URL-enkoodattujen pyyntöjen käsittelyyn
app.use(cookieParser()); // Käytetään cookie-parser-middlewarea evästeiden käsittelyyn
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Määritellään session salaisuus
    resave: false, // Estetään session uudelleentallennus jokaisen pyynnön yhteydessä
    saveUninitialized: true, // Tallennetaan uusi sessio, vaikka se ei olisi alustettu
    cookie: { secure: false } // Määritellään, että evästeitä ei tarvitse lähettää vain suojatuissa yhteyksissä
}));

// Swagger documentation route should be before any authentication
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Päivitetty autentikointi middleware staattisille tiedostoille
const authenticateStaticFiles = (req, res, next) => {
    // 1. Tarkista onko käyttäjällä valittu tili
    if (!req.session || !req.session.selectedAccountId) {
        return res.status(401).json({
            message: 'Valitse ensin tili',
            error: 'NO_ACCOUNT_SELECTED'
        });
    }

    // 2. Tarkista token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: 'Kirjaudu ensin sisään',
            error: 'NO_TOKEN'
        });
    }

    jwt.verify(token, process.env.MY_TOKEN, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'Kirjautuminen vanhentunut',
                error: 'INVALID_TOKEN'
            });
        }

        // 3. Hae pyydetty kuvatiedosto
        const requestedFile = path.basename(req.path);

        // 4. Tarkista onko kuva kyseisen tilin käyttäjän kuva
        const query = `
            SELECT user.pic_path 
            FROM user 
            JOIN account ON user.id_user = account.id_user 
            WHERE account.id_account = ? 
            AND user.pic_path = ?`;

        db.query(query, [req.session.selectedAccountId, requestedFile], (err, results) => {
            if (err) {
                console.log('Database error:', err);
                return res.status(500).json({ message: 'Sisäinen virhe' });
            }

            if (results.length === 0) {
                return res.status(403).json({
                    message: 'Ei oikeutta tähän kuvaan',
                    error: 'ACCESS_DENIED'
                });
            }

            // Kuva kuuluu kirjautuneen käyttäjän tiliin, annetaan pääsy
            next();
        });
    });
};

// Configure static files with authentication
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use('/public', authenticateStaticFiles, express.static(publicPath));

app.use(logRequests); // Käytetään logRequests-middlewarea pyyntöjen lokitukseen

app.use('/card_login', cardLoginRouter); // Määritellään card_login-reitti
app.use('/atm', atmRouter); // Määritellään ATM-reitti
app.use('/admin_login', adminLoginRouter); // Määritellään admin_login-reitti

app.use('/admin', adminRouter); // Määritellään admin-reitti
app.use('/user', verifyToken, restrictToAdmin, userRouter); // Määritellään user-reitti, joka vaatii autentikoinnin ja admin-oikeudet
app.use('/account', verifyToken, restrictToAdmin, accountRouter); // Määritellään account-reitti, joka vaatii autentikoinnin ja admin-oikeudet
app.use('/card_account', verifyToken, restrictToAdmin, cardAccountRouter); // Määritellään card_account-reitti, joka vaatii autentikoinnin ja admin-oikeudet
app.use('/card', verifyToken, restrictToAdmin, cardRouter); // Määritellään card-reitti, joka vaatii autentikoinnin ja admin-oikeudet
app.use('/transactions', verifyToken, restrictToAdmin, transactionRouter); // Määritellään transactions-reitti, joka vaatii autentikoinnin ja admin-oikeudet

module.exports = app; // Viedään Express-sovellus ulos käyttöön
