const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const dotenv = require('dotenv');

dotenv.config();

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new DailyRotateFile({
            filename: 'log-%DATE%.txt',
            dirname: process.env.LOG_PATH || './logs',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new transports.Console()
    ]
});

function logRequests(req, res, next) {
    const { method, url, body, headers } = req;
    logger.info(`Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Headers: ${JSON.stringify(headers)}`);

    const originalSend = res.send;
    res.send = function (data) {
        logger.info(`Response: ${method} ${url} - Status: ${res.statusCode} - Body: ${data}`);
        originalSend.apply(res, arguments);
    };

    next();
}

module.exports = { logger, logRequests };
