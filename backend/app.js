const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { swaggerUi, specs } = require('./swagger');
const atmRouter = require('./routes/atm');
const adminRouter = require('./routes/admin_login'); 
const userRouter = require('./routes/user');
const accountRouter = require('./routes/account');
const cardAccountRouter = require('./routes/card_account');
const cardRouter = require('./routes/card');
const transactionRouter = require('./routes/transaction');
const cardLoginRouter = require('./routes/card_login');
const adminLoginRouter = require('./routes/admin_login'); // Ensure admin_login router is imported
const { logRequests } = require('./logger');
const { verifyToken, restrictToAdmin } = require('./middleware/auth_middleware');

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(logRequests); 

app.use('/card_login', cardLoginRouter);
app.use('/atm', atmRouter);
app.use('/admin_login', adminLoginRouter); // Ensure admin_login route is added

app.use('/admin', verifyToken, restrictToAdmin, adminRouter);
app.use('/user', verifyToken, restrictToAdmin, userRouter);
app.use('/account', verifyToken, restrictToAdmin, accountRouter);
app.use('/card_account', verifyToken, restrictToAdmin, cardAccountRouter);
app.use('/card', verifyToken, restrictToAdmin, cardRouter);
app.use('/transactions', verifyToken, restrictToAdmin, transactionRouter);

module.exports = app;
