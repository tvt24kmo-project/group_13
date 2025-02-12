const express = require('express'); // Tuodaan Express-kirjasto, joka mahdollistaa web-palvelimen luomisen
const router = express.Router(); // Luodaan uusi reititin Expressille, joka auttaa määrittämään HTTP-reittejä
const jwt = require('jsonwebtoken'); // Tuodaan jsonwebtoken-kirjasto JWT-tunnisteiden luomiseen ja tarkistamiseen
const Account = require('../models/account_model'); // Tuodaan Account-malli, joka määrittelee tilitietokannan rakenteen
const Transaction = require('../models/transaction_model'); // Tuodaan Transaction-malli, joka määrittelee tapahtumatietokannan rakenteen
const CardAccount = require('../models/card_account_model'); // Tuodaan CardAccount-malli, joka määrittelee korttitilitietokannan rakenteen
const User = require('../models/user_model'); // Tuodaan User-malli, joka määrittelee käyttäjätietokannan rakenteen

/**
 * @swagger
 * tags:
 *   name: ATM
 *   description: ATM operations
 */

function authenticateToken(req, res, next) { // Funktio, joka tarkistaa ja autentikoi JWT-tunnisteen
    const authHeader = req.headers['authorization']; // Haetaan authorization-otsikosta mahdollinen tunniste
    const token = authHeader && authHeader.split(' ')[1]; // Otetaan tunniste talteen, jos löytyy
    if (!token) return res.sendStatus(403); // Jos tunnistetta ei ole, palautetaan statuskoodi 403

    jwt.verify(token, process.env.MY_TOKEN, (err, user) => { // Tarkistetaan tunniste ja puretaan se käyttäjäksi 
        if (err) return res.sendStatus(403); // Jos tunnistetta ei löydy tai se on vanhentunut, palautetaan statuskoodi 403
        req.user = user; // Jos tunniste löytyy, asetetaan käyttäjä pyynnön user-ominaisuudeksi

        // Tarkistetaan, onko käyttäjä kirjattu ulos
        if (req.session && req.session.loggedOutTokens && req.session.loggedOutTokens.includes(token)) {
            return res.sendStatus(403); // Jos token on kirjattu ulos, palautetaan statuskoodi 403
        }

        next(); // Siirrytään seuraavaan middlewareen tai reittiin 
    });
}

router.use(authenticateToken); // Käytetään authenticateToken-funktiota kaikille reiteille, jotka määritellään tämän reitittimen kanssa

/**
 * @swagger
 * /atm/accounts:
 *   get:
 *     summary: Get accounts linked to the card
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: A list of account types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   account_type:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/accounts', (req, res) => { // Reitti, joka hakee kaikki tilit, jotka on linkitetty korttiin
    const cardId = req.user.id; // Haetaan käyttäjän ID, joka saatiin JWT-tunnisteesta ja lisättiin pyyntöön 'user' -kenttään authenticateToken-funktiossa

    CardAccount.getByCardId(cardId, (err, accounts) => { // Haetaan tilit, jotka on linkitty korttiin 
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus 
            console.error('Error fetching accounts:', err); // Kirjataan virheilmoitus konsoliin 
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus 
        }
        const accountTypes = accounts.map(account => ({ account_type: account.account_type })); // Muutetaan tilitiedot haluttuun muotoon, eli otetaan vain tilin tyyppi ('account_type') talteen ja muodostetaan uusi taulukko
        res.status(200).json(accountTypes); // Palautetaan statuskoodi 200 ja tilitiedot JSON-muodossa 
    });
});

/**
 * @swagger
 * /atm/select-account:
 *   post:
 *     summary: Select an account for transactions
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_type:
 *                 type: string
 *                 description: The type of the account to select (debit or credit)
 *     responses:
 *       200:
 *         description: Account selected successfully
 *       400:
 *         description: Bad request
 */
router.post('/select-account', (req, res) => { // Reitti, joka valitsee käyttäjälle tilin
    const { account_type } = req.body; // Haetaan pyynnön body-osiosta tilin tyyppi ('account_type')
    const cardId = req.user.id; // Haetaan käyttäjän ID, joka saatiin autentikoinnista (JWT-tunnisteessa)

    CardAccount.getByCardId(cardId, (err, accounts) => { // Haetaan tilit, jotka on linkitetty korttiin
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus 
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus 
        }

        const selectedAccount = accounts.find(account => account.account_type === account_type); // Etsitään tilitaulukosta haluttu tili, joka vastaa pyynnön body-osiosta saatuun tyyppiin
        if (!selectedAccount) { // Jos tiliä ei löydy, palautetaan virheilmoitus 
            return res.status(400).json({ message: 'Account type not found' }); // Palautetaan statuskoodi 400 ja virheilmoitus 
        }

        req.session.selectedAccountId = selectedAccount.id_account; // Tallennetaan valitun tilin ID sessioon, jotta se voidaan käyttää myöhemmin muiden pyyntöjen yhteydessä
        res.status(200).json({ message: 'Account selected successfully' }); // Palautetaan statuskoodi 200 ja onnistumisilmoitus 
    });
});

/**
 * @swagger
 * /atm/withdraw:
 *   post:
 *     summary: Withdraw money from the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: No account selected or invalid amount or insufficient funds
 *       500:
 *         description: Internal server error
 */
router.post('/withdraw', (req, res) => { // Reitti, joka käsittelee nostopyynnön
    const { amount } = req.body; // Haetaan pyynnön body-osiosta nostettava summa ('amount')
    const accountId = req.session.selectedAccountId; // Haetaan valitun tilin ID sessiosta 

    if (!accountId) { // Jos tiliä ei ole valittu, palautetaan virheilmoitus 
        return res.status(400).json({ message: 'No account selected' }); // Palautetaan statuskoodi 400 ja virheilmoitus 
    }

    const parsedAmount = parseFloat(amount); // Muutetaan nostettava summa numeroiksi ja otetaan se talteen 
    if (isNaN(parsedAmount) || parsedAmount <= 0) { // Jos summa ei ole numero tai se on pienempi tai yhtä suuri kuin nolla, palautetaan virheilmoitus 
        return res.status(400).json({ message: 'Invalid amount' }); // Palautetaan statuskoodi 400 ja virheilmoitus 
    }

    Account.checkBalance(accountId, parsedAmount, (err, hasSufficientFunds) => { // Tarkistetaan, onko tilillä tarpeeksi varoja 
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus 
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus 
        }
        if (!hasSufficientFunds) { // Jos varoja ei ole tarpeeksi, palautetaan virheilmoitus 
            return res.status(400).json({ message: 'Insufficient funds' }); // Palautetaan statuskoodi 400 ja virheilmoitus 
        }

        Account.withdrawAmount(accountId, parsedAmount, (err) => { // Nostetaan summa tililtä 
            if (err) { // Jos tulee virhe, palautetaan virheilmoitus 
                return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus 
            }

            Transaction.create({ // Luodaan tapahtuma, jossa näkyy tilin ID, nostettava summa ja muut tiedot 
                transaction_type: 'withdrawal', // Määritellään tapahtuman tyyppi 
                sum: parsedAmount, // Määritellään nostettava summa 
                type: 'ATM', // Määritellään tapahtuman tyyppi 
                id_account: accountId // Määritellään tilin ID
            }, (err) => { // Jos tulee virhe, palautetaan virheilmoitus 
                if (err) { // Jos tulee virhe, palautetaan virheilmoitus
                    return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus 
                }

                res.status(200).json({ message: 'Withdrawal successful' }); // Palautetaan statuskoodi 200 ja onnistumisilmoitus 
            });
        });
    });
});

/**
 * @swagger
 * /atm/transactions:
 *   post:
 *     summary: Get paginated transactions for the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: The page number to retrieve
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: No account selected
 *       500:
 *         description: Internal server error
 */
router.post('/transactions', (req, res) => { // Reitti, joka hakee sivutetut tapahtumat valitulle tilille
    const accountId = req.session.selectedAccountId; // Haetaan valitun tilin ID sessiosta
    const page = parseInt(req.body.page) || 1; // Haetaan pyynnön body-osiosta sivunumero ('page')
    const limit = 10; // Määritellään sivun koko
    const offset = (page - 1) * limit; // Lasketaan ohitettava määrä rivejä

    if (!accountId) { // Jos tiliä ei ole valittu, palautetaan virheilmoitus
        return res.status(400).json({ message: 'No account selected' }); // Palautetaan statuskoodi 400 ja virheilmoitus
    }

    Transaction.getByAccountId(accountId, limit, offset, (err, transactions) => { // Haetaan tapahtumat tilin ID:n perusteella
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus
        }
        const filteredTransactions = transactions.map(({ id_transaction, id_account, ...rest }) => rest); // Suodatetaan pois id_transaction ja id_account kentät
        res.status(200).json(filteredTransactions); // Palautetaan statuskoodi 200 ja tapahtumat JSON-muodossa
    });
});

/**
 * @swagger
 * /atm/balance:
 *   get:
 *     summary: Get the balance of the selected account
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: The balance of the selected account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                 available_credit:
 *                   type: number
 *       400:
 *         description: No account selected
 *       500:
 *         description: Internal server error
 */
router.get('/balance', (req, res) => { // Reitti, joka hakee valitun tilin saldon
    const accountId = req.session.selectedAccountId; // Haetaan valitun tilin ID sessiosta

    if (!accountId) { // Jos tiliä ei ole valittu, palautetaan virheilmoitus
        return res.status(400).json({ message: 'No account selected' }); // Palautetaan statuskoodi 400 ja virheilmoitus
    }

    Account.getById(accountId, (err, account) => { // Haetaan tilin tiedot
        if (err) { // Jos tulee virhe, palautetaan virheilmoitus
            return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus
        }

        CardAccount.getAccountType(accountId, (err, accountType) => { // Haetaan tilin tyyppi card_account taulusta
            if (err) { // Jos tulee virhe, palautetaan virheilmoitus
                return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus
            }

            if (accountType === 'credit') { // Jos tili on luottotili
                Account.getAvailableCredit(accountId, (err, availableCredit) => { // Haetaan käytettävissä oleva luotto
                    if (err) { // Jos tulee virhe, palautetaan virheilmoitus
                        return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus
                    }
                    res.status(200).json({ balance: account.balance, available_credit: availableCredit }); // Palautetaan saldo ja käytettävissä oleva luotto
                });
            } else { // Jos tili on debit-tili
                res.status(200).json({ balance: account.balance }); // Palautetaan vain saldo
            }
        });
    });
});

/**
 * @swagger
 * /atm/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [ATM]
 *     security:
 *       - user: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/logout', (req, res) => { // Reitti, joka kirjaa käyttäjän ulos
    const token = req.headers['authorization'].split(' ')[1]; // Haetaan token authorization-otsikosta
    jwt.verify(token, process.env.MY_TOKEN, (err, user) => { // Tarkistetaan token ja puretaan se käyttäjäksi
        if (err) { // Jos token on virheellinen
            return res.status(403).json({ message: 'Forbidden' }); // Palautetaan statuskoodi 403 ja virheilmoitus
        }
        req.session.destroy(err => { // Tuhoaa käyttäjän session
            if (err) { // Jos tulee virhe, palautetaan virheilmoitus
                return res.status(500).json({ message: 'Internal server error' }); // Palautetaan statuskoodi 500 ja virheilmoitus
            }
            res.status(200).json({ message: 'Logout successful' }); // Palautetaan statuskoodi 200 ja onnistumisilmoitus
        });
    });
});

/**
 * @swagger
 * /atm/getUserData:
 *   get:
 *     summary: Get user data for the currently selected account
 *     tags: [ATM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 pic_path:
 *                   type: string
 *       400:
 *         description: No account selected
 *       500:
 *         description: Internal server error
 */
router.get('/getUserData', (req, res) => {
    const accountId = req.session.selectedAccountId;

    if (!accountId) {
        return res.status(400).json({ message: 'No account selected' });
    }

    const query = `
        SELECT user.firstname, user.lastname, user.pic_path
        FROM user 
        JOIN account ON user.id_user = account.id_user 
        WHERE account.id_account = ?`;

    db.query(query, [accountId], (err, results) => {
        if (err) {
            console.log('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(results[0]);
    });
});

module.exports = router; // Viedään reititin ulos käyttöön
