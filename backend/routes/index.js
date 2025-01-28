const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Index
 *   description: Index route
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Index route
 *     tags: [Index]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/', function(req, res, next) {
    res.send('Welcome to the Bank Automat API');
});

module.exports = router;
