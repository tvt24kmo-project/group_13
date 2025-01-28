const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const admin = require('../models/admin_model');
dotenv.config();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin_login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     security:
 *       - admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/', function(request, response) {
    const { username, password } = request.body;

    admin.getByUsername(username, function(err, dbResult) {
        if (err) {
            return response.status(500).json(err);
        }
        if (dbResult.length === 0) {
            return response.status(403).json({ error: 'Invalid credentials' });
        }

        bcrypt.compare(password, dbResult[0].password, function(err, compareResult) {
            if (err) {
                return response.status(500).json(err);
            }
            if (compareResult) {
                const token = generateAccessToken({ username: username, role: 'admin' }, '3600s');
                response.json({ token: token });
            } else {
                response.status(403).json({ error: 'Invalid credentials' });
            }
        });
    });
});

function generateAccessToken(admin, expiresIn) {
    const token = jwt.sign(admin, process.env.MY_TOKEN, { expiresIn: expiresIn });
    return token;
}

module.exports = router;
