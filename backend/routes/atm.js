const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Account = require('../models/account_model');
const Transaction = require('../models/transaction_model');
const CardAccount = require('../models/card_account_model');
const User = require('../models/user_model');

/**
 * @swagger
 * tags:
 *   name: ATM
 *   description: ATM operations
 */

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.MY_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

router.use(authenticateToken);

/**
 * @swagger
 * /atm/accounts:
 *   get:
 *     summary: Get accounts linked to the card
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: A list of account types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   account_type:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/accounts', (req, res) => {
    const cardId = req.user.id;

    CardAccount.getByCardId(cardId, (err, accounts) => {
        if (err) {
            console.error('Error fetching accounts:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        const accountTypes = accounts.map(account => ({ account_type: account.account_type }));
        res.status(200).json(accountTypes);
    });
});

/**
 * @swagger
 * /atm/select-account:
 *   post:
 *     summary: Select an account for transactions
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_type:
 *                 type: string
 *                 description: The type of the account to select (debit or credit)
 *     responses:
 *       200:
 *         description: Account selected successfully
 *       400:
 *         description: Bad request
 */
router.post('/select-account', (req, res) => {
    const { account_type } = req.body;
    const cardId = req.user.id;

    CardAccount.getByCardId(cardId, (err, accounts) => {
        if (err) {
            console.error('Error fetching accounts:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const selectedAccount = accounts.find(account => account.account_type === account_type);
        if (!selectedAccount) {
            return res.status(400).json({ message: 'Account type not found' });
        }

        req.session.selectedAccountId = selectedAccount.id_account;
        console.log('Selected account ID:', selectedAccount.id_account);
        res.status(200).json({ message: 'Account selected successfully' });
    });
});

/**
 * @swagger
 * /atm/withdraw:
 *   post:
 *     summary: Withdraw money from the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: No account selected or invalid amount or insufficient funds
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw', (req, res) => {
    const { amount } = req.body;
    const accountId = req.session.selectedAccountId;

    console.log('Withdraw request:', req.body); 
    if (!accountId) {
        console.log('No account selected');
        return res.status(400).json({ message: 'No account selected' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.log('Invalid amount:', amount);
        return res.status(400).json({ message: 'Invalid amount' });
    }

    console.log('Checking balance for account:', accountId, 'with amount:', parsedAmount);
    Account.checkBalance(accountId, parsedAmount, (err, hasSufficientFunds) => {
        if (err) {
            console.log('Error checking balance:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (!hasSufficientFunds) {
            console.log('Insufficient funds');
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        console.log('Withdrawing amount:', parsedAmount, 'from account:', accountId);
        Account.withdrawAmount(accountId, parsedAmount, (err) => {
            if (err) {
                console.log('Error withdrawing amount:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            console.log('Creating transaction for account:', accountId, 'with amount:', parsedAmount);
            Transaction.create({
                transaction_type: 'withdrawal',
                sum: parsedAmount,
                type: 'ATM',
                id_account: accountId
            }, (err) => {
                if (err) {
                    console.log('Error creating transaction:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                console.log('Withdrawal successful');
                res.status(200).json({ message: 'Withdrawal successful' });
            });
        });
    });
});

/**
 * @swagger
 * /atm/transactions:
 *   post:
 *     summary: Get paginated transactions for the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: The page number to retrieve
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: No account selected
 *       500:
 *         description: Internal server error
 */
router.post('/transactions', (req, res) => {
    const accountId = req.session.selectedAccountId;
    const page = parseInt(req.body.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    console.log('Fetching transactions for account ID:', accountId, 'Page:', page);

    if (!accountId) {
        console.log('No account selected');
        return res.status(400).json({ message: 'No account selected' });
    }

    Transaction.getByAccountId(accountId, limit, offset, (err, transactions) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        console.log('Transactions fetched successfully:', transactions);
        const filteredTransactions = transactions.map(({ id_transaction, id_account, ...rest }) => rest);
        res.status(200).json(filteredTransactions);
    });
});

/**
 * @swagger
 * /atm/balance:
 *   get:
 *     summary: Get the balance of the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: The balance of the selected account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *       400:
 *         description: No account selected
 *       500:
 *         description: Internal server error
 */
router.get('/balance', (req, res) => {
    const accountId = req.session.selectedAccountId;

    console.log('Fetching balance for account ID:', accountId);

    if (!accountId) {
        console.log('No account selected');
        return res.status(400).json({ message: 'No account selected' });
    }

    Account.getBalance(accountId, (err, balance) => {
        if (err) {
            console.error('Error fetching balance:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        console.log('Balance fetched successfully:', balance);

        // Fetch the account type from the card_account table
        CardAccount.getByAccountId(accountId, (err, cardAccount) => {
            if (err) {
                console.error('Error fetching card account:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            const accountType = cardAccount.account_type; // Ensure this is the correct column name

            if (accountType === 'credit') {
                Account.getAvailableCredit(accountId, (err, availableCredit) => {
                    if (err) {
                        console.error('Error fetching available credit:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    console.log('Available credit fetched successfully:', availableCredit);
                    res.status(200).json({ balance, availableCredit });
                });
            } else {
                res.status(200).json({ balance });
            }
        });
    });
});

/**
 * @swagger
 * /atm/user-info:
 *   get:
 *     summary: Get user information associated with the card
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 pic_path:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/user-info', (req, res) => {
    const cardId = req.user.id;

    CardAccount.getByCardId(cardId, (err, accounts) => {
        if (err) {
            console.error('Error fetching accounts:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts linked to this card' });
        }

        const accountId = accounts[0].id_account;
        console.log('Fetched account ID:', accountId); // Add logging

        Account.getById(accountId, (err, account) => {
            if (err) {
                console.error('Error fetching account:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            console.log('Fetched account:', account); // Add logging to verify the account object

            const userId = account[0].id_user; // Access the first element of the account array
            console.log('Fetched user ID:', userId); // Add logging

            User.getById(userId, (err, user) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                const { firstname, lastname, pic_path } = user;
                res.status(200).json({ firstname, lastname, pic_path });
            });
        });
    });
});

module.exports = router;
