const express = require('express');
const router = express.Router();
const { verifyToken, restrictToAdmin } = require('../middleware/auth_middleware');
const user = require('../models/user_model');
const logger = require('../logger');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', restrictToAdmin, function(request, response) {
    user.getAll(function(err, result) {
        if (err) {
            logger.error(`Error fetching users: ${err}`);
            response.json(err);
        } else {
            logger.info('Fetched all users');
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', restrictToAdmin, function(request, response) {
    user.getById(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error fetching user by ID: ${err}`);
            response.json(err);
        } else {
            logger.info(`Fetched user by ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Add a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               pic_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', restrictToAdmin, function(request, response) {
    user.add(request.body, function(err, result) {
        if (err) {
            logger.error(`Error adding user: ${err}`);
            response.json(err);
        } else {
            logger.info('Added new user');
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               pic_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.put('/:id', restrictToAdmin, function(request, response) {
    user.update(request.params.id, request.body, function(err, result) {
        if (err) {
            logger.error(`Error updating user: ${err}`);
            response.json(err);
        } else {
            logger.info(`Updated user with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The deleted user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.delete('/:id', restrictToAdmin, function(request, response) {
    user.delete(request.params.id, function(err, result) {
        if (err) {
            logger.error(`Error deleting user: ${err}`);
            response.json(err);
        } else {
            logger.info(`Deleted user with ID: ${request.params.id}`);
            response.json(result);
        }
    });
});

module.exports = router;