# group_13

# Frontend / Bank-Automat

# Backend RestAPI

## Käytössä olevat Node.JS moduulit:
- bcrypt
- cookie-parser
- dotenv
- express
- express-session
- jsonwebtoken
- morgan
- mysql2
- swagger-jsdoc
- swagger-ui-express
- winston
- winston-daily-rotate-file
- crypto
- co
- debug
- nodemon (devDependencies)

## HOX HOX!!
Käytössä dotenv moduuli. Luokaa siis backend kansioon oma .env tiedosto ja syöttäkää siihen oman ympäristönne tiedot. Backend kansiossa on .env tiedoston malli. Lisätkää sinne muuttujia jos niitä joudutte omaan ympäristöön luomaan. Siitä on sitte kätevä muiden päivittää omaa .env tiedostoa. **MUISTAJAA POISTAA KAIKKI OMAN YMPÄRISTÖN TIEDOT!!!**

## Päivitä paikallinen versio

Kun vedät reposta uuden version omalle koneellesi, varmista, että kaikki tarvittavat moduulit ovat ajantasalla. Suorita seuraavat komennot backend-kansiossa:

```bash
cd backend
npm install
```

Tämä varmistaa, että kaikki Node.js-moduulit asennetaan ja päivitetään.

Muista myös tarkistaa, että `.env` tiedostosi sisältää kaikki `env-sample.txt` tiedoston muuttujat ja että niihin on asetettu tarvittavat tiedot omassa ympäristössäsi.

## RestAPI-dokumentaatio

RestAPI-dokumentaatio on saatavilla Swaggerin kautta osoitteessa `http://localhost:<portti>/api-docs`, jossa `<portti>` on palvelimen käyttämä portti. Swaggerin avulla voit tarkastella ja testata API-pyyntöjä helposti selaimessa.

## create_default_admin.js script

`create_default_admin.js` skripti on tarkoitettu luomaan oletus admin-käyttäjä tietokantaan. Tämä skripti tarkistaa, onko admin-käyttäjä (ID 1) jo olemassa, ja jos ei ole, se luo uuden admin-käyttäjän käyttäen ympäristömuuttujissa määriteltyjä tunnuksia.

### Käyttö

1. Varmista, että `.env` tiedostossa on määritelty `INITIAL_ADMIN_USERNAME` ja `INITIAL_ADMIN_PASSWORD`.
2. Aja skripti komennolla:
   ```bash
   node create_default_admin.js
   ```
3. Skripti luo admin-käyttäjän tietokantaan, jos sitä ei vielä ole olemassa.

### Miksi tämä skripti on olemassa?

Tämä skripti helpottaa kehitysympäristön pystyttämistä ja varmistaa, että järjestelmässä on aina olemassa admin-käyttäjä, jolla voidaan hallinnoida sovellusta. Tämä on erityisen hyödyllistä uusille kehittäjille ja testausympäristöissä.

## create_token.js script

`create_token.js` skripti on tarkoitettu luomaan satunnainen token, jota voidaan käyttää sovelluksen eri osissa, kuten autentikoinnissa tai salauksessa. Skripti generoi 64 tavun pituisen satunnaisen tokenin ja tulostaa sen konsoliin.

### Käyttö

1. Aja skripti komennolla:
   ```bash
   node create_token.js
   ```
2. Kopioi tulostettu token ja sijoita se `.env` tiedostoon muuttujaan `MY_TOKEN`:
   ```
   MY_TOKEN=kopioitu_token
   ```

### Miksi tämä skripti on olemassa?

Tämä skripti helpottaa turvallisten ja satunnaisten tokenien luomista, joita voidaan käyttää sovelluksen eri osissa. Tokenit ovat tärkeitä esimerkiksi autentikoinnissa ja tietoturvassa.

## ATM-toiminnan kulku

Tässä osiossa kuvataan tyypillinen ATM-toiminnan kulku REST API:n näkökulmasta.

### 1. Kortin syöttö ja PIN-koodin syöttö

1. ATM-laite lukee kortin numeron ja kehottaa käyttäjää syöttämään PIN-koodin.
2. ATM lähettää pyynnön REST API:lle käyttäjän tunnistamiseksi ja tokenin saamiseksi.

**Pyyntö:**
```http
POST /card_login
Content-Type: application/json

{
  "card_number": "1234567890123456",
  "pin": "1234"
}
```

**Vastaus:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Saatavilla olevien tilien haku

1. ATM käyttää saatua tokenia pyytääkseen korttiin linkitetyt tilit.

**Pyyntö:**
```http
GET /atm/accounts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Vastaus:**
```json
[
  { "account_type": "debit" },
  { "account_type": "credit" }
]
```

### 3. Tilin valinta

1. Jos vastauksessa on sekä "debit" että "credit", ATM kehottaa käyttäjää valitsemaan, kumpaa tiliä käytetään.
2. Jos saatavilla on vain yksi tilityyppi, ATM valitsee sen automaattisesti.
3. ATM lähettää valitun tilityypin REST API:lle vahvistaakseen valinnan.

**Pyyntö:**
```http
POST /atm/select-account
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "account_type": "debit"
}
```

**Vastaus:**
```json
{
  "message": "Account selected successfully"
}
```

### 4. Päävalikko

1. Kun tili on valittu, ATM näyttää käyttäjälle päävalikon, jossa hän voi suorittaa erilaisia toimintoja, kuten tarkistaa saldon, nostaa rahaa jne.

### 5. Saldo kysely

1. Jos käyttäjä valitsee päävalikosta "balance" tai "saldo", ATM lähettää pyynnön REST API:lle käyttäjän tokenilla varustettuna.
2. REST API palauttaa valitun tilin saldon. Debit-tilissä vain balance-tiedon, credit-tilissä balance ja saatavilla olevan luoton.

**Pyyntö:**
```http
GET /atm/balance
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Vastaus (debit-tili):**
```json
{
  "balance": 1000.00
}
```

**Vastaus (credit-tili):**
```json
{
  "balance": -500.00,
  "available_credit": 9500.00
}
```

3. Jos käyttäjä palaa takaisin päävalikkoon, ei vaadita mitään toimia REST API:lle.

### 6. Tilitapahtumien kysely

1. Jos käyttäjä valitsee päävalikosta "transactions" tai "tilitapahtumat", ATM lähettää pyynnön REST API:lle käyttäjän tokenilla varustettuna.
2. Pyyntö lähetetään POST-komennolla, koska mukana lähetetään sivunumero. Oletuksena lähetetään sivu yksi, joka näyttää tilitapahtumat nykyhetkestä 10 uusinta. Sivu 2 näyttää 11-20, sivu 3 21-30 jne.

**Pyyntö:**
```http
POST /atm/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "page": 1
}
```

**Vastaus:**
```json
[
  {
    "date": "2023-10-01T12:00:00Z",
    "transaction_type": "withdrawal",
    "sum": 100.00,
    "type": "ATM"
  },
  // ...9 muuta tapahtumaa...
]
```

3. ATM-näkymässä on painikkeet, joilla käyttäjä voi selata seuraavan tai edellisen sivun tilitapahtumia.
4. ATM:n tulee varmistaa, ettei se yritä hakea sivua 0. Jos esimerkiksi sivu 3 palauttaa tyhjän vastauksen, tietoa ei näytetä käyttäjälle.

5. Jos käyttäjä palaa takaisin päävalikkoon, ei vaadita mitään toimia REST API:lle.

### 7. Rahan nosto

1. Jos käyttäjä valitsee päävalikosta "withdrawal" tai "nosto", ATM kysyy käyttäjältä, kuinka paljon rahaa hän haluaa nostaa. Tämä toiminto on täysin ATM-käyttöliittymän varassa, ja vaihtoehdot voivat olla esimerkiksi 20, 50, 100, 150, 200 tai muu summa.
2. Kun summa on saatu käyttäjältä, ATM tarkistaa, että se kykenee antamaan pyydetyn rahasumman (eli koneessa on sopivia rahoja riittävästi).
3. Jos rahaa on riittävästi, ATM lähettää REST API:lle pyynnön tokenilla ja halutulla rahasummalla.

**Pyyntö:**
```http
POST /atm/withdraw
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 100
}
```

4. REST API tarkistaa, onko aiemmin valitulla tilillä riittävästi katetta. Debit-tilissä tarkistetaan, ettei balance mene nollaan, ja credit-tilillä tarkistetaan, ettei balance mene nollan alapuolelle enemmän kuin limit antaa luvan.
5. Jos katetta on, REST API muodostaa automaattisesti transaction-tauluun tarvittavan merkinnän ja vähentää tililtä pyydetyn rahamäärän. REST API palauttaa ATM-laitteelle, että nosto onnistui.

**Vastaus (onnistunut nosto):**
```json
{
  "message": "Withdrawal successful"
}
```

6. Tämän jälkeen ATM-laite antaa rahan käyttäjälle ja palaa päävalikkoon.
7. Jos tilillä ei ole katetta, REST API palauttaa, että ei ole katetta, ATM-laitteelle.

**Vastaus (ei katetta):**
```json
{
  "message": "Insufficient funds"
}
```

8. ATM kysyy käyttäjältä, haluaako hän yrittää uudestaan jollain muulla summalla.
9. Jos käyttäjä haluaa kokeilla uudestaan, näkymä palaa rahan valintaan.
10. Jos käyttäjä ei halua kokeilla uudestaan, ATM palaa päävalikkoon.

### 8. Uloskirjautuminen

1. Jos käyttäjä valitsee päävalikosta "logout" tai "kirjaudu ulos", ATM lähettää pyynnön REST API:lle käyttäjän tokenilla varustettuna.
2. REST API tuhoaa käyttäjän session ja palauttaa onnistumisilmoituksen.

**Pyyntö:**
```http
POST /atm/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Vastaus:**
```json
{
  "message": "Logout successful"
}
```

3. ATM kirjaa käyttäjän ulos ja palaa aloitusnäyttöön.

### 9. Automaattinen uloskirjautuminen

1. Tokenin elinikä REST API:ssa on tällä hetkellä 3 minuuttia.
2. ATM:n tulee kirjata käyttäjä automaattisesti ulos 3 minuutin kohdalla tai jos REST API palauttaa forbidden (403) -vastauksen.

Tämä kulku varmistaa, että ATM-laite kommunikoi REST API:n kanssa oikein käyttäjän tunnistamiseksi, saatavilla olevien tilien hakemiseksi, oikean tilin valitsemiseksi, saldon tarkistamiseksi, tilitapahtumien hakemiseksi, rahan nostamiseksi ja uloskirjautumiseksi.

## ER-Kaavio

![ER Kaavio](er_kaavio.png)
