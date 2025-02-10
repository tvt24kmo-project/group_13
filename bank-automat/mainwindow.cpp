#include "mainwindow.h"
#include "login.h"
#include "ui_mainwindow.h" // Sisällytetään automaattisesti luotu käyttöliittymätiedosto (ui_mainwindow.h), joka sisältää UI-komponentit, kuten painikkeet ja kentät.

// MainWindow-luokan konstruktori. Se ottaa vastaan mahdollisen parent-olion (vanhempi-widgetin) ja alustaa käyttöliittymäobjektin (ui).
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this); // Alustetaan käyttöliittymä. Tämä liittää UI-komponentit MainWindow-olioon.
}

// MainWindow-luokan destruktori. Kutsutaan, kun olio tuhotaan.
MainWindow::~MainWindow()
{
    delete ui; // Vapautetaan käyttöliittymäobjektin varaama muisti.
}

// Tämä funktio suoritetaan, kun btnstart-nimistä painiketta klikataan.
void MainWindow::on_btnstart_clicked()
{
    Login *objLogin = new Login(); // Luodaan uusi Login-ikkuna. Tässä ei aseteta parenttia, mikä tarkoittaa, että se ei ole osa nykyistä ikkunahierarkiaa.

    objLogin->show(); // Näytetään Login-ikkuna käyttäjälle.
    this->close();  // Suljetaan vanha ikkuna kokonaan, suljetaan nykyinen pääikkuna.
}

