#ifndef ENVIRONMENT_H
#define ENVIRONMENT_H

#include <QtCore/QString>  // Sisällytetään QString-luokka merkkijonojen käsittelyä varten

// Environment-luokka, joka sisältää sovelluksen ympäristömuuttujat ja konfiguraatiot
class Environment
{
public:
    // Oletuskonstruktori
    Environment();
    
    // Staattinen metodi, joka palauttaa palvelimen perus-URL-osoitteen
    // @return QString: palvelimen osoite muodossa "https://palvelin:portti"
    static QString base_url();
};

#endif // ENVIRONMENT_H
