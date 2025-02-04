const express = require('express'); // Tuodaan Express-kirjasto
const path = require('path'); // Tuodaan path-kirjasto tiedostopolkujen käsittelyyn
const cookieParser = require('cookie-parser'); // Tuodaan cookie-parser middleware evästeiden käsittelyyn
const session = require('express-session'); // Tuodaan express-session middleware sessioiden hallintaan
const morgan = require('morgan'); // Tuodaan morgan middleware HTTP-pyyntöjen lokitukseen
const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto ympäristömuuttujien hallintaan
const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken-kirjasto JWT-tunnisteiden luomiseen ja tarkistamiseen
const { swaggerUi, specs } = require('./swagger'); // Tuodaan Swagger-dokumentaation asetukset
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
app.use(express.static(path.join(__dirname, 'public'))); // Määritellään julkinen hakemisto staattisille tiedostoille

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs)); // Määritellään Swagger-dokumentaation reitti

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
