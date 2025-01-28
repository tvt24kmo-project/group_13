const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const card = require('../models/card_model');
const account = require('../models/account_model');
const user = require('../models/user_model');

dotenv.config();

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.error('Token is required');
        return res.status(403).send('Token is required');
    }

    console.log('Verifying token:', token);
    jwt.verify(token, process.env.MY_TOKEN, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).send('Invalid token');
        }
        req.user = decoded;
        next();
    });
}

function restrictToUserAssets(req, res, next) {
    if (req.user.role === 'user') {
        const card_number = req.user.card_number;
        card.getUserAssets(card_number, (err, assets) => {
            if (err) return res.status(500).send('Error fetching user assets');
            const accountIds = assets.map(asset => asset.id_account);
            req.user.assets = {
                accounts: accountIds
            };
            // Fetch the user ID associated with the card
            card.getByCardNumber(card_number, (err, cardResult) => {
                if (err) return res.status(500).send('Error fetching card information');
                if (cardResult.length > 0) {
                    req.user.id_user = cardResult[0].id_user;
                }
                next();
            });
        });
    } else {
        next();
    }
}

function checkUserAccess(req, res, next) {
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.user.role === 'user') {
        const requestedId = req.params.id;
        console.log('Checking access for ID:', requestedId);
        user.getById(requestedId, (err, result) => {
            if (err) {
                console.error('Error fetching user by ID:', err);
                return res.status(500).send('Internal server error');
            }
            if (!result.length) {
                console.log('User not found or access denied');
                return res.status(403).send('Access denied');
            }
            const userId = result[0].id_user;
            console.log('Fetched user ID:', userId);
            console.log('User assets:', req.user.assets);
            if (req.user.id_user !== userId) {
                console.log('Access denied for user ID:', userId);
                return res.status(403).send('Access denied');
            }
            next();
        });
    } else {
        next();
    }
}

function checkCardAccess(req, res, next) {
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.user.role === 'user') {
        const requestedCardId = req.params.id;
        console.log('Checking access for card ID:', requestedCardId);
        card.getById(requestedCardId, (err, result) => {
            if (err) {
                console.error('Error fetching card by ID:', err);
                return res.status(500).send('Internal server error');
            }
            if (!result.length) {
                console.log('Card not found or access denied');
                return res.status(403).send('Access denied');
            }
            const accountId = result[0].id_account;
            console.log('Fetched account ID:', accountId);
            console.log('User assets:', req.user.assets);
            if (!req.user.assets.accounts.includes(accountId)) {
                console.log('Access denied for account ID:', accountId);
                return res.status(403).send('Access denied');
            }
            next();
        });
    } else {
        next();
    }
}

function checkAccountAccess(req, res, next) {
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.user.role === 'user') {
        const requestedAccountId = req.params.id;
        console.log('Checking access for account ID:', requestedAccountId);
        account.getById(requestedAccountId, (err, result) => {
            if (err) {
                console.error('Error fetching account by ID:', err);
                return res.status(500).send('Internal server error');
            }
            if (!result.length) {
                console.log('Account not found or access denied');
                return res.status(403).send('Access denied');
            }
            const accountId = result[0].id_account;
            console.log('Fetched account ID:', accountId);
            console.log('User assets:', req.user.assets);
            if (!req.user.assets.accounts.includes(accountId)) {
                console.log('Access denied for account ID:', accountId);
                return res.status(403).send('Access denied');
            }
            next();
        });
    } else {
        next();
    }
}

function restrictToAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
}

module.exports = { verifyToken, restrictToUserAssets, checkUserAccess, checkCardAccess, checkAccountAccess, restrictToAdmin };

