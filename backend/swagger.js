const swaggerJsdoc = require('swagger-jsdoc'); // Tuodaan swagger-jsdoc-kirjasto Swagger-dokumentaation luomiseen
const swaggerUi = require('swagger-ui-express'); // Tuodaan swagger-ui-express-kirjasto Swagger-käyttöliittymän näyttämiseen

const options = {
    definition: {
        openapi: '3.0.0', // Määritellään OpenAPI-versio
        info: {
            title: 'Bank Automat API', // API:n nimi
            version: '1.0.0', // API:n versio
            description: 'API documentation for the Bank Automat project', // Lyhyt kuvaus API:sta
        },
        servers: [
            {
                url: 'http://localhost:3000', // API-palvelimen URL
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                adminBearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Account: {
                    type: 'object',
                    properties: {
                        id_account: { type: 'integer', description: 'Primary key' },
                        amount: { type: 'number' },
                        limit: { type: 'number' },
                        balance: { type: 'number' },
                        id_user: { type: 'integer', description: 'Foreign key to User' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id_user: { type: 'integer', description: 'Primary key' },
                        firstname: { type: 'string' },
                        lastname: { type: 'string' },
                        pic_path: { type: 'string' },
                    },
                },
                Card: {
                    type: 'object',
                    properties: {
                        id_card: { type: 'integer', description: 'Primary key' },
                        card_number: { type: 'string' },
                        pin: { type: 'string' },
                        retrys: { type: 'integer' },
                    },
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id_transaction: { type: 'integer', description: 'Primary key' },
                        transaction_type: { type: 'string' },
                        sum: { type: 'number' },
                        date: { type: 'string', format: 'date-time' },
                        type: { type: 'string' },
                        id_account: { type: 'integer', description: 'Foreign key to Account' },
                    },
                },
                CardAccount: {
                    type: 'object',
                    properties: {
                        id_card_account: { type: 'integer', description: 'Primary key' },
                        id_card: { type: 'integer', description: 'Foreign key to Card' },
                        id_account: { type: 'integer', description: 'Foreign key to Account' },
                        account_type: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                adminBearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Polku API-dokumentaatiolle
};

const specs = swaggerJsdoc(options); // Luodaan Swagger-dokumentaatio annetuilla asetuksilla

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: ATM
 *     description: ATM operations including image retrieval
 */

/**
 * @swagger
 * /public/{filename}:
 *   get:
 *     summary: Get user's profile picture
 *     tags: [ATM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the image file (e.g., "jaakko-teppo.jpg")
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No active session or authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Valitse ensin tili
 *                 error:
 *                   type: string
 *                   example: NO_ACCOUNT_SELECTED
 *       403:
 *         description: Access denied to this image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ei oikeutta tähän kuvaan
 *                 error:
 *                   type: string
 *                   example: ACCESS_DENIED
 */

module.exports = {
    swaggerUi,
    specs,
};
