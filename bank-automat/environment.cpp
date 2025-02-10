#include <QtCore/QString> // Sisällytetään Qt:n QString-luokka, jota käytetään merkkijonojen käsittelyyn.
#include "environment.h" // Sisällytetään environment.h-tiedosto, jossa Environment-luokka on määritelty.

Environment::Environment() {} // Environment-luokan konstruktori. Ei suorita mitään erityistä, vain alustaa olion.

QString Environment::base_url() // Määritellään base_url-metodi, joka palauttaa QString-tyyppisen arvon.
{
    return "https://bank.sara.vehvilainen.cc:3000";  // Palautetaan kovakoodattu URL-osoite merkkijonona.
}
