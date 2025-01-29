const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const card = require('../models/card_model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


router.post('/',
    function(request, response) {
        if(request.body.card_number && request.body.pin){ //tarkistetaan että käyttäjä antaa kortin numeron ja PIN-koodin.
            const card_number = request.body.card_number;  
            const pin = request.body.pin;
                                                                                //^eli jos molemmat annettu edetään.
            card.checkPin(card_number, function(dbError, dbResult) { //haetaan kortin PIN tietokannasta card_modelin kautta.
                if(dbError){ 
                    response.json(dbError);
                }
                else{
                    if (dbResult.length > 0) {  
                        bcrypt.compare(pin,dbResult[0].pin, function
                            (err,compareResult){   //vaikka on sama pin, se kryptattu versio on aina ihan erilainen.
                                                //// Compare-funktiolla testataan onko true vai false verrattaessa kryptattua versiota ja annettua PIN-koodia.
                                                //dbResult[0] on tietokannasta saatu kryptattu pin.> success> generoidaan token vastauksena.
                            if(compareResult) {
                                console.log("Success");
                                const token = generateAccessToken({card_number:
                                card_number});
                                response.send(token);
                            } 
                            else {
                                console.log("wrong PIN");
                                response.send(false);
                            }
                        }
                    );
                }
                else{
                    console.log("Card not found");
                    response.send(false);
                }
            }
        }
    );
}
else{
    console.log("Card number or PIN missing"); 
    response.send(false);
}
}
);

function generateAccessToken(card) { //tässä on se token-funcktio.
dotenv.config();
return jwt.sign(card, process.env.MY_TOKEN, {expiresIn: '1800s'}); //kun loginin jälkeen aika on umpeutunut, pitää taas kirjautua uudelleen.(tämä on voimassa 30 minuuttia, tätä aikaa voi pienentää.) //täällä on My-token niinku app.js:ssäkin.  
}

module.exports=router;