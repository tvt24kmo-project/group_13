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

module.exports = {
    swaggerUi,
    specs,
};
