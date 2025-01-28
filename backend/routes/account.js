const express = require('express');
const router = express.Router();
const { verifyToken, restrictToUserAssets, checkAccountAccess, restrictToAdmin } = require('../middleware/auth_middleware');
const account = require('../models/account_model');

router.use(verifyToken);
router.use(restrictToUserAssets);

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account management
 */

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Get all accounts
 *     tags: [Account]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', checkAccountAccess, function(request, response) {
    account.getAll(function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Account]
 *     security:
 *       - user: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     responses:
 *       200:
 *         description: An account object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', checkAccountAccess, function(request, response) {
    account.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /account/user/{id}:
 *   get:
 *     summary: Get accounts by user ID
 *     tags: [Account]
 *     security:
 *       - user: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/user/:id', checkAccountAccess, function(request, response) {
    account.getByUserId(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Add a new account
 *     tags: [Account]
 *     security:
 *       - admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               limit:
 *                 type: number
 *               balance:
 *                 type: number
 *               id_user:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The created account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) {
    account.add(request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   put:
 *     summary: Update an account
 *     tags: [Account]
 *     security:
 *       - admin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               limit:
 *                 type: number
 *               balance:
 *                 type: number
 *               id_user:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) {
    account.update(request.params.id, request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /account/{id}:
 *   delete:
 *     summary: Delete an account
 *     tags: [Account]
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
 *         description: The deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) {
    account.delete(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports = router;