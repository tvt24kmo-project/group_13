const express = require('express');
const router = express.Router();
const { verifyToken, restrictToUserAssets, restrictToAdmin } = require('../middleware/auth_middleware');
const transaction = require('../models/transaction_model');

router.use(verifyToken);
router.use(restrictToUserAssets);

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management
 */

/**
 * @swagger
 * /transactions/account/{id_account}:
 *   get:
 *     summary: Get transactions for a specific account
 *     tags: [Transaction]
 *     security:
 *       - card: []
 *     parameters:
 *       - in: path
 *         name: id_account
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/account/:id_account', function(request, response) {
    const accountId = parseInt(request.params.id_account, 10);
    if (!request.user.assets.accounts.includes(accountId)) {
        return response.status(403).send('Access denied');
    }
    transaction.getByAccount(accountId, function(err, result) {
        if (err) {
            console.error('Error fetching user transactions:', err);
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transaction]
 *     security:
 *       - card: []
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', function(request, response) {
    transaction.getAll(function(err, result) {
        if (err) {
            console.error('Error fetching transactions:', err);
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transaction]
 *     security:
 *       - card: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: A transaction object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', function(request, response) {
    transaction.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result[0]);
        }
    });
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_account:
 *                 type: integer
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The created transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) {
    transaction.add(request.body, function(err, result) {
        if (err) {
            console.error('Error adding transaction:', err);
            response.json(err);
        } else {
            response.json(request.body);
        }
    });
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_account:
 *                 type: integer
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The updated transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) {
    transaction.update(request.params.id, request.body, function(err, result) {
        if (err) {
            console.error('Error updating transaction:', err);
            response.json(err);
        } else {
            response.json(result.affectedRows);
        }
    });
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: The deleted transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) {
    transaction.delete(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result.affectedRows);
        }
    });
});

module.exports = router;