const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bank Automat API',
            version: '1.0.0',
            description: 'API documentation for the Bank Automat project',
        },
        servers: [
            {
                url: 'http://localhost:3000',
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
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
