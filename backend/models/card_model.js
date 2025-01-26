const db=require('../database');
const bcrypt = require('bcrypt');//otetaan käyttöön bcrypt-kirjasto. pitäisi löytyä sitten npm install -komennon myötä. jos ei, niin sen voi ladata erikseen.

const card = {
    getAll:function(callback){
        return db.query('SELECT * FROM card', callback);
    },
    getById:function(id,callback){
        return db.query('SELECT * FROM card WHERE id_card=?', [id],callback);
    },
    add:function(card_data,callback){
        bcrypt.hash(card_data.pin, 10, function(err,hashed_pin){ //PIN-koodin hashauksen suorittaminen
            if (err) {
                return callback(err); //palautetaan virhe, jos toiminto epäonnistuu
            }
            return db.query('INSERT INTO card(`type`, card_number, pin, retrys) VALUES(?,?,?,?)',[card_data.type, card_data.card_number, hashed_pin, card_data.retrys],callback); //suoritetaan tietokantakysely hashatulla PIN-koodilla.
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
    }
};

module.exports=card;