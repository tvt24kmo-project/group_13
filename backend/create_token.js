// Tuodaan tarvittavat kirjastot
var crypto = require('crypto'); // Node.js:n 'crypto' kirjasto, jota käytetään satunnaisten tavujen (bytes) luomiseen
var co = require('co'); // Co-kirjasto, joka mahdollistaa generaattorien käyttöä asynkronisessa koodissa

// Luodaan funktio, joka generoi 64 satunnaista tavua ja palauttaa ne takaisin
function spawnTokenBuf() {
    return function(callback) {
        crypto.randomBytes(64, callback); // Luodaan 64 satunnaista tavua ja annetaan tulos callback-funktioon
    };
}

// Käytetään Co-kirjastoa, joka mahdollistaa generaattorin käyttöä asynkronisessa ympäristössä
co(function* () {
    // Käytetään spawnTokenBuf() funktiota, joka generoi satunnaisia tavuja
    const buffer = yield spawnTokenBuf(); // Odotetaan tulosta ja tallennetaan se muuttujaan 'buffer'
    
    // Tulostetaan satunnaiset tavut base64-muodossa
    console.log(buffer.toString('base64')); // Muutetaan buffer base64-muotoon ja tulostetaan
});
