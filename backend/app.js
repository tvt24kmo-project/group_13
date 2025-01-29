var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var accountRouter = require('./routes/account');
var cardAccountRouter = require('./routes/card_account');
var cardRouter = require('./routes/card');
var transactionRouter = require('./routes/transaction');
var loginRouter = require('./routes/login');
const jwt = require('jsonwebtoken');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/login', loginRouter);

app.use('/user', userRouter);
app.use('/account', accountRouter);
app.use('/card_account', cardAccountRouter);
app.use(authenticateToken);
app.use('/card',cardRouter);
app.use('/transaction', transactionRouter);



function authenticateToken(req, res, next) {  
                                                   
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] //luento1 kohdasta 2h51 min. postman-bearer token riisutaan. **lisää alla
                                                     
    console.log("token = "+token);
     jwt.verify(token, process.env.MY_TOKEN, function(err, card) { //tässä on .env.MY_TOKEN ja myös login.js-tiedostossa. alempana tässä tietoa lisää* 
        if (err) return res.sendStatus(403)

            req.card = card
            
            next()
    })
}

 //Kun tämä authenticateToken ominaisuus on nyt lisätty ja yritetään postmanissa esim käyttää operaatiota GET allcards> tulee lukemaan "401 unauthorized".
// >> 1 Login pyynnön lähetys SEND (postman) //eli siis ensin tietty add request> POST -login>SEND
// 2 kopioi talteen token.(postman)
//3 mene bank-automat juureen ja kohdasta authorization (postman)
//4 auth type> bearer token
//5 kohtaan "Token" kopioidaan token. ja save.
//6. sitten metodit pitäisi taas toimia oikein.
//**kun tehdään Qt-sovellusta ja loginia,meidän pitää itse lisätä sana bearer, tokenin eteen jotta authenticateToken-metodi toimii.

//tokenin lisääminen koodiin: kirjoitetaan komento backendistä "node create_token.js>>.env"pitäisi tulla suoraan env-tiedostoon generoitu token.
// tokenin generoinnista luento 1 kohta 2h 30 min. 
module.exports = app;
