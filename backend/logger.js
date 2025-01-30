const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const dotenv = require('dotenv');

dotenv.config();

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new DailyRotateFile({
            filename: 'log-%DATE%.txt',
            dirname: process.env.LOG_PATH || './logs',
            datePattern: 'YYYY-MM-DD',
            maxSize: '5m',
            maxFiles: '14d', // Säilytä lokitiedostot 14 päivää
            zippedArchive: true,
        }),
        new transports.Console()
    ]
});

module.exports = logger;
