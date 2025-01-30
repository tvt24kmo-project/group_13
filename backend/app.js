var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var logger = require('./logger'); // Import logger
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const adminRouter = require('./routes/admin_login');
const { swaggerUi, specs } = require('./swagger');

dotenv.config();

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var accountRouter = require('./routes/account');
var cardAccountRouter = require('./routes/card_account');
var cardRouter = require('./routes/card');
var transactionRouter = require('./routes/transaction');
var loginRouter = require('./routes/login');
var adminLoginRouter = require('./routes/admin_login');

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/admin_login', adminLoginRouter);
app.use(authenticateToken);
app.use('/user', userRouter);
app.use('/account', accountRouter);
app.use('/card_account', cardAccountRouter);
app.use(authenticateToken);
app.use('/card', cardRouter);
app.use('/transactions', transactionRouter);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.MY_TOKEN, function(err, user) {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.sendStatus(403);
        }
        next();
    });
}

app.use('/admin', authenticateAdmin, adminRouter);

module.exports = app;
