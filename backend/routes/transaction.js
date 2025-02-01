const express = require('express');
const router = express.Router();
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware');
const transaction = require('../models/transaction_model');
const logger = require('../logger');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction management
 */

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transaction]
 *     security:
 *       - admin: []
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
router.get('/', restrictToAdmin, function(request, response) {
    transaction.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching transactions: ${err}`);
            response.json(err);
        } else {
            logger.info('Fetched all transactions');
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     summary: Get transaction by ID
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
 *         description: A transaction object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) {
    transaction.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching transaction by ID: ${err}`);
            response.json(err);
        } else {
            logger.info(`Fetched transaction by ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transaction/account/{id}:
 *   get:
 *     summary: Get transactions by account ID
 *     tags: [Transaction]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/account/:id', restrictToAdmin, function(request, response) {
    transaction.getByAccount(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching transactions by account ID: ${err}`);
            response.json(err);
        } else {
            logger.info(`Fetched transactions by account ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transaction:
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
 *               transaction_type:
 *                 type: string
 *               sum:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               id_account:
 *                 type: integer
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
            logger.error(`Error adding transaction: ${err}`);
            response.json(err);
        } else {
            logger.info('Added new transaction');
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
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
 *               transaction_type:
 *                 type: string
 *               sum:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               id_account:
 *                 type: integer
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
            logger.error(`Error updating transaction: ${err}`);
            response.json(err);
        } else {
            logger.info(`Updated transaction with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /transaction/{id}:
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
            logger.error(`Error deleting transaction: ${err}`);
            response.json(err);
        } else {
            logger.info(`Deleted transaction with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

module.exports = router;