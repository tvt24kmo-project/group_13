const db=require('../database');
const bcrypt = require('bcrypt');//otetaan käyttöön bcrypt-kirjasto. pitäisi löytyä sitten npm install -komennon myötä. jos ei, niin sen voi ladata erikseen.

const card = {

    checkPin:function(card_number, callback){
        return db.query('SELECT id_card, pin FROM card WHERE card_number=?' ,[card_number],callback);  //käyttäjä antaa loginformiin card numberin ja PIN-koodin-> tämä card_number annetaan tälle
                                                                                                //  kyselylle joka sit palauttaa kyseisen..cryptatun PIN-koodin sieltä tietokannasta.
        },

    getAll:function(callback){
        return db.query('SELECT * FROM card', callback);
    },
    getById:function(id,callback){
        return db.query('SELECT * FROM card WHERE id_card=?', [id],callback);
    },

    getByType: function(type, callback) {
        return db.query('SELECT * FROM card WHERE type = ?', [type], callback); 
    },
    add:function(card_data, callback) {
        // Tarkistetaan, onko kortti jo olemassa
        db.query('SELECT * FROM card WHERE card_number = ?', [card_data.card_number], function(err, existingCard) { //tähän yritin lisätä sellaista tarkastus-funktiota kun ei toiminut, että se ei antaisi lisätä päällekkäisiä kortteja. Että jos esim joku korttinro on jo lisätty, niin se ei suostuisi lisäämään samaa uudelleen. 
            if (err) {
                return callback(err);  // Virhe käsitellään tässä
            }
            
            // Jos kortti on jo olemassa, palautetaan virhe
            if (existingCard.length > 0) {
                return callback(new Error('Card number already exists'));  // Palautetaan virheviesti, jos kortti löytyy
            }
    
            // Jos korttia ei ole olemassa, jatketaan PIN-koodin salauksella ja lisätään kortti tietokantaan
            bcrypt.hash(card_data.pin, 10, function(err, hashed_pin) {
                if (err) {
                    return callback(err);  // Virhe käsitellään tässä
                }
    
                // Kortin lisäys tietokantaan
                db.query('INSERT INTO card(`type`, card_number, pin, retrys) VALUES(?,?,?,?)', 
                    [card_data.type, card_data.card_number, hashed_pin, card_data.retrys], callback);
            });
        });

     //Käytetään hashed_pin muuttujaa add ja updatessa card_data.pin sijaan INSERT-kyselyssä, koska hashed_pin sisältää salatun PIN-koodin.
 
    },
    update:function(id,card_data,callback){
        if(card_data.pin) { //tarkistetaan onko pin mukana päivitettävissä tiedoissa.
        bcrypt.hash(card_data.pin, 10, function(err, hashed_pin){ //hashataan uus pin, jos se on mukana päivitettävissä tiedoissa
            if (err) {
                return callback(err);
            }
            return db.query('UPDATE card SET `type`=?,pin=?, retrys=? WHERE id_card=?',[card_data.type, hashed_pin, card_data.retrys,id],callback);//suoritetaan tietokantakysely hashatulla pin-koodilla.
        });
        
        } else {
//jos pin-koodia ei ole mukana, ei hashata
return db.query('UPDATE card SET `type`=?, retrys=? WHERE id_card=?',[card_data.type,card_data.retrys,id],callback);

        }
    },
    delete:function(id,callback){
        return db.query('DELETE FROM card WHERE id_card=?',[id],callback);

    },

checkPin:function(card_number,callback){
    return db.query('SELECT pin FROM card WHERE card_number=?',[card_number],callback);
}
}
    //HOX. TUOSSA YLEMPÄNÄ ON SE getbytype-metodi. //tässä tosiaan tämä joka huomioi korttien tyypit, että pystytään etsimään tietokannasta joko double-korttia,
    //  tai credit tai debit-korttia. Lisäsin tietokantaan type-kohtaan credit, debit, double. Yritin postmanissa lähettää sitten niitä tietoja silleen, että URL-polussa olisi kerrottu 
    // mikä kortti kyseessä. Laitoin myös loginiin ja add-cardiin postmanissa JSONia, jossa luki korttinumero, pinkoodi, janiin edelleen. Tämä koodi siis teille tutkittavaksi!
module.exports=card;