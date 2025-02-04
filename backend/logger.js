const { createLogger, format, transports } = require('winston'); // Tuodaan tarvittavat osat winston-kirjastosta
const { combine, timestamp, printf } = format; // Tuodaan tarvittavat formatointifunktiot winstonista
const DailyRotateFile = require('winston-daily-rotate-file'); // Tuodaan winston-daily-rotate-file-kirjasto lokitiedostojen pyörittämiseen
const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto ympäristömuuttujien hallintaan
const debug = require('debug')('app:logger'); // Tuodaan debug-kirjasto ja määritellään nimi

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta

const logFormat = printf(({ level, message, timestamp }) => { // Määritellään lokiviestin muotoilu
    return `${timestamp} ${level}: ${message}`; // Palautetaan lokiviesti muodossa "timestamp level: message"
});

const logger = createLogger({ // Luodaan uusi logger-olio
    level: 'debug', // Asetetaan lokitustaso
    format: combine( // Määritellään lokiviestin formatointi
        timestamp(), // Lisätään aikaleima
        logFormat // Käytetään aiemmin määriteltyä lokiformaattia
    ),
    transports: [ // Määritellään lokiviestien kuljetukset
        new DailyRotateFile({ // Käytetään päivittäin pyörivää lokitiedostoa
            filename: 'log-%DATE%.txt', // Tiedoston nimi, jossa %DATE% korvataan päivämäärällä
            dirname: process.env.LOG_PATH || './logs', // Lokitiedostojen hakemisto
            datePattern: 'YYYY-MM-DD', // Päivämäärän muoto tiedoston nimessä
            maxSize: '50m', // Maksimikoko yhdelle lokitiedostolle
            maxFiles: '14d', // Kuinka monta päivää lokitiedostoja säilytetään
            zippedArchive: true, // Pakataan vanhat lokitiedostot zip-muotoon
        }),
        new transports.Console() // Tulostetaan lokiviestit myös konsoliin
    ]
});

function logRequests(req, res, next) { // Middleware-funktio, joka lokittaa HTTP-pyynnöt ja vastaukset
    const { method, url, body, headers } = req; // Haetaan pyynnön tiedot
    logger.info(`Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Headers: ${JSON.stringify(headers)}`); // Lokitetaan pyyntö
    debug(`Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Headers: ${JSON.stringify(headers)}`); // Debug-lokitus pyynnöstä

    const originalSend = res.send; // Tallennetaan alkuperäinen res.send-funktio
    res.send = function (data) { // Korvataan res.send omalla funktiolla
        logger.info(`Response: ${method} ${url} - Status: ${res.statusCode} - Body: ${data}`); // Lokitetaan vastaus
        debug(`Response: ${method} ${url} - Status: ${res.statusCode} - Body: ${data}`); // Debug-lokitus vastauksesta
        originalSend.apply(res, arguments); // Kutsutaan alkuperäistä res.send-funktiota
    };

    next(); // Siirrytään seuraavaan middlewareen
}

module.exports = { logger, logRequests }; // Viedään logger ja logRequests käytettäväksi muissa tiedostoissa
