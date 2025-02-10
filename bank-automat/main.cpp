#include "mainwindow.h" // Sisällytetään mainwindow.h-tiedosto, joka sisältää MainWindow-luokan määrittelyn.
#include <QApplication> // Sisällytetään QApplication-luokka, joka on Qt:n sovelluksen ydinluokka ja tarvitaan GUI-sovelluksissa.

int main(int argc, char *argv[]) // Määritellään pääohjelma, joka on sovelluksen aloituspiste. Se ottaa komentoriviparametrit vastaan.
{
    QApplication a(argc, argv); // Luodaan QApplication-olio, joka hallitsee sovelluksen tapahtumasilmukkaa ja muita perusasioita.
    MainWindow w; // Luodaan MainWindow-luokan olio, joka edustaa pääikkunaa.
    w.show(); // Näytetään pääikkuna ruudulla.
    return a.exec(); // Käynnistetään Qt:n tapahtumasilmukka, joka odottaa ja käsittelee käyttäjän syötteitä.
}
