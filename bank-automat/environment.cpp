#include <QtCore/QString>
#include "environment.h"

// Tyhjä konstruktori, koska luokka sisältää vain staattisen metodin
Environment::Environment() {}

// Palauttaa palvelimen osoitteen
// Tämä osoite on kovakoodattu tähän, tuotantoversiossa voisi tulla esim. config-tiedostosta
// @return QString: palvelimen täydellinen URL-osoite HTTPS-protokollalla
QString Environment::base_url()
{
    return "https://bank.sara.vehvilainen.cc:3000";  // Palvelimen osoite ja portti
}
