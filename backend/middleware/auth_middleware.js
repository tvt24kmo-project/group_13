const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken-kirjasto, joka mahdollistaa JWT-tokenien luomisen ja tarkistamisen
const dotenv = require('dotenv'); // Tuodaan dotenv-kirjasto, joka lataa ympäristömuuttujat .env-tiedostosta
const card = require('../models/card_model'); // Tuodaan korttimalli, joka käsittelee kortteihin liittyviä tietokantakyselyitä
const account = require('../models/account_model'); // Tuodaan tilimalli, joka käsittelee tileihin liittyviä tietokantakyselyitä
const Transaction = require('../models/transaction_model'); // Tuodaan transaktiomalli, joka käsittelee transaktioihin liittyviä tietokantakyselyitä

dotenv.config(); // Ladataan ympäristömuuttujat .env-tiedostosta käyttöön

function verifyToken(req, res, next) { // Middleware-funktio, joka tarkistaa ja vahvistaa käyttäjän JWT-tokenin
    const authHeader = req.headers['authorization']; // Haetaan Authorization-header pyynnöstä
    const token = authHeader && authHeader.split(' ')[1]; // Erotetaan token muodosta "Bearer TOKEN"
    if (!token) { // Jos tokenia ei ole, palautetaan virhe
        console.error('Token is required'); // Tulostetaan virheilmoitus palvelimen konsoliin
        return res.status(403).send('Token is required'); // Lähetetään HTTP 403 -virhekoodi asiakkaalle
    }

    console.log('Verifying token:', token); // Tulostetaan token lokiin tarkistusta varten
    jwt.verify(token, process.env.MY_TOKEN, (err, decoded) => { // Tarkistetaan tokenin oikeellisuus salaisella avaimella
        if (err) { // Jos token on virheellinen, palautetaan virhe 
            console.error('Token verification error:', err); // Tulostetaan virheilmoitus
            return res.status(403).send('Invalid token'); // Palautetaan HTTP 403 -virhekoodi
        }
        req.user = decoded; // Jos token on kelvollinen, tallennetaan käyttäjätiedot requestiin
        next(); // Jatketaan seuraavaan middlewareen
    });
}

function restrictToATM(req, res, next) { // Middleware-funktio, joka sallii vain tietyt ATM-reitit
    const allowedRoutes = ['/atm/accounts', '/atm/select-account', '/atm/withdraw', '/atm/transactions', '/atm/balance']; // Lista sallituista ATM-reiteistä
    if (allowedRoutes.includes(req.path)) { // Tarkistetaan, kuuluuko nykyinen reitti sallittuihin
        return next(); // Jos kuuluu, siirrytään eteenpäin
    }
    return res.sendStatus(403); // Jos ei kuulu, palautetaan HTTP 403 -virhe Forbidden
}

function checkCardAccess(req, res, next) { // Middleware-funktio, joka tarkistaa, onko käyttäjällä pääsy tiettyyn korttiin
    if (req.user.role === 'admin') { // Jos käyttäjä on admin, annetaan pääsy automaattisesti
        return next(); // Siirrytään seuraavaan middlewareen
    }
    if (req.user.role === 'user') { // Jos käyttäjä on tavallinen käyttäjä
        const requestedCardId = req.params.id; // Haetaan pyydetty kortti-ID URL-parametrista
        console.log('Checking access for card ID:', requestedCardId); // Lokitetaan tarkistettava kortti-ID
        card.getById(requestedCardId, (err, result) => { // Haetaan kortti tietokannasta kortti-ID:n perusteella
            if (err) { // Jos tietokantahaussa tapahtuu virhe (esim. yhteysongelma)
                console.error('Error fetching card by ID:', err); // Tulostetaan virhe palvelimen lokiin
                return res.status(500).send('Internal server error'); // Palautetaan HTTP 500 -virhe
            }
            if (!result.length) { // Jos korttia ei löydy annetulla ID:llä
                console.log('Card not found or access denied'); // Lokitetaan tieto, että korttia ei löytynyt
                return res.status(403).send('Access denied'); // Estetään pääsy HTTP 403 -virheellä
            }
            const accountId = result[0].id_account; // Haetaan korttiin liittyvän tilin ID
            console.log('Fetched account ID:', accountId); // Lokitetaan haettu tili-ID
            console.log('User assets:', req.user.assets); // Lokitetaan käyttäjän hallussa olevat resurssit
            if (!req.user.assets.accounts.includes(accountId)) { // Jos korttiin liittyvä tili ei kuulu käyttäjälle
                console.log('Access denied for account ID:', accountId); // Tulostetaan lokiin, että pääsy on estetty
                return res.status(403).send('Access denied'); // Lähetetään selaimelle virheilmoitus (403 = pääsy estetty)
            }
            next(); // Jos kaikki ehdot täyttyvät, siirrytään seuraavaan middlewareen
        });
    } else {
        next(); // Jos käyttäjä ei ole "admin" tai "user", jatketaan normaalisti seuraavaan middlewareen
    }
}

function checkAccountAccess(req, res, next) { // Middleware-funktio, joka tarkistaa, onko käyttäjällä pääsy tiettyyn tiliin
    if (req.user.role === 'admin') { // Jos käyttäjä on admin, hänellä on automaattisesti pääsy
        return next(); // Siirrytään seuraavaan middlewareen ilman tarkistuksia
    }
    if (req.user.role === 'user') { // Jos käyttäjä on tavallinen käyttäjä
        const requestedAccountId = req.params.id; // Haetaan pyydetyn tilin ID URL-parametrista
        console.log('Checking access for account ID:', requestedAccountId); // Lokitetaan tarkistettava tili-ID
        account.getById(requestedAccountId, (err, result) => { // Haetaan tilin tiedot tietokannasta
            if (err) { // Jos tietokantakyselyssä tapahtuu virhe
                console.error('Error fetching account by ID:', err); // Tulostetaan virhe palvelimen lokiin
                return res.status(500).send('Internal server error'); // Lähetetään selaimelle virheilmoitus (500 = palvelinvirhe)
            }
            if (!result.length) { // Jos tiliä ei löydy annetulla ID:llä
                console.log('Account not found or access denied'); // Tulostetaan lokiin, että tiliä ei löytynyt tai käyttö on estetty
                return res.status(403).send('Access denied'); // Lähetetään selaimelle virheilmoitus (403 = pääsy estetty)
            }
            const accountId = result[0].id_account; // Haetaan tilin ID tietokannasta
            console.log('Fetched account ID:', accountId); // Lokitetaan haettu tili-ID
            console.log('User assets:', req.user.assets); // Lokitetaan käyttäjän omistamat resurssit
            if (!req.user.assets.accounts.includes(accountId)) { // Jos käyttäjällä ei ole oikeutta tähän tiliin
                console.log('Access denied for account ID:', accountId); // Tulostetaan lokiin, että pääsy on estetty
                return res.status(403).send('Access denied'); // Lähetetään selaimelle virheilmoitus (403 = pääsy estetty)
            }
            next(); // Jos kaikki ehdot täyttyvät, siirrytään seuraavaan middlewareen
        });
    } else {
        next(); // Jos käyttäjä ei ole "admin" tai "user", jatketaan normaalisti seuraavaan middlewareen
    }
}

function checkTransactionAccess(req, res, next) { // Middleware-funktio, joka tarkistaa, onko käyttäjällä pääsy tiettyyn transaktioon
    const userId = req.user.id; // Haetaan kirjautuneen käyttäjän ID
    const transactionId = req.params.id; // Haetaan pyydetyn transaktion ID URL-parametrista

    Transaction.getById(transactionId, (err, transaction) => { // Haetaan transaktio tietokannasta
        if (err || !transaction) { // Jos tapahtuu virhe tai transaktiota ei löydy
            return res.sendStatus(403); // Estetään pääsy ja palautetaan 403 (pääsy estetty)
        }

        Account.getById(transaction.id_account, (err, account) => { // Haetaan transaktion liittyvä tili tietokannasta
            if (err || !account || account.id_user !== userId) { // Jos tiliä ei löydy tai käyttäjä ei omista sitä
                return res.sendStatus(403); // Estetään pääsy ja palautetaan 403 (pääsy estetty)
            }
            next(); // Jos kaikki ehdot täyttyvät, siirrytään seuraavaan middlewareen
        });
    });
}

function restrictToAdmin(req, res, next) { // Middleware-funktio, joka rajoittaa pääsyn vain admin-käyttäjille
    if (req.user && req.user.role === 'admin') { // Jos käyttäjä on kirjautunut ja hänen roolinsa on "admin"
        return next(); // Siirrytään seuraavaan middlewareen ilman rajoituksia
    }
    return res.sendStatus(403); // Jos käyttäjä ei ole admin, estetään pääsy ja palautetaan 403 (pääsy estetty)
}

module.exports = { verifyToken, restrictToATM, checkCardAccess, checkAccountAccess, checkTransactionAccess, restrictToAdmin }; // Viedään kaikki funktiot käytettäväksi muissa tiedostoissa

