const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin_model');
const dotenv = require('dotenv');
const { logger } = require('../logger');

dotenv.config();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations
 */

/**
 * @swagger
 * /admin_login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
router.post('/', (req, res) => {
    const { username, password } = req.body;

    Admin.getByUsername(username, (err, admin) => {
        if (err) {
            logger.error(`Internal server error: ${err}`);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (!admin) {
            logger.warn(`Invalid username or password for username ${username}`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (!admin.password) {
            logger.warn(`Password not found for username ${username}`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                logger.error(`Internal server error: ${err}`);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!isMatch) {
                logger.warn(`Invalid username or password for username ${username}`);
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ id: admin.id_admin, role: 'admin' }, process.env.MY_TOKEN, { expiresIn: '15m' });
            logger.info(`Admin logged in with username ${username}`);
            res.status(200).json({ token });
        });
    });
});

module.exports = router;
