#include "mainwindow.h"
#include "login.h"
#include "ui_mainwindow.h" // Sisällytetään automaattisesti luotu käyttöliittymätiedosto (ui_mainwindow.h), joka sisältää UI-komponentit, kuten painikkeet ja kentät.

// MainWindow-luokan konstruktori. Se ottaa vastaan mahdollisen parent-olion (vanhempi-widgetin) ja alustaa käyttöliittymäobjektin (ui).
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)  // Alustetaan QMainWindow parent-parametrilla
    , ui(new Ui::MainWindow)  // Luodaan uusi käyttöliittymäolio
{
    ui->setupUi(this); // Alustetaan käyttöliittymä. Tämä liittää UI-komponentit MainWindow-olioon.
    
    // Ladataan ja asetetaan tervetulokuva resurssitiedostosta
    QPixmap originalPix(":/img/landing-picture.jpg");
    if (!originalPix.isNull()) {
        // Skaalataan kuva säilyttäen mittasuhteet ja käyttäen pehmeää skaalausta
        ui->imgLabel->setPixmap(originalPix.scaled(ui->imgLabel->size(), 
                              Qt::KeepAspectRatio, 
                              Qt::SmoothTransformation));
    }

    // Asennetaan tapahtumasuodatin kuvalle ikkunan koon muutosten seuraamiseksi
    ui->imgLabel->installEventFilter(this);

    // Asetetaan kuvan minimikokoasetukset
    ui->imgLabel->setMinimumSize(400, 300);
    ui->imgLabel->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
}

// MainWindow-luokan destruktori. Kutsutaan, kun olio tuhotaan.
MainWindow::~MainWindow()
{
    delete ui; // Vapautetaan käyttöliittymäobjektin varaama muisti.
}

// Tämä funktio suoritetaan, kun btnstart-nimistä painiketta klikataan.
void MainWindow::on_btnstart_clicked()
{
    // Luodaan uusi kirjautumisikkuna
    Login *objLogin = new Login(); // Luodaan uusi Login-ikkuna. Tässä ei aseteta parenttia, mikä tarkoittaa, että se ei ole osa nykyistä ikkunahierarkiaa.

    // Näytetään kirjautumisikkuna
    objLogin->show(); // Näytetään Login-ikkuna käyttäjälle.
    // Suljetaan tervetulonäkymä
    this->close();  // Suljetaan vanha ikkuna kokonaan, suljetaan nykyinen pääikkuna.
}

// Tapahtumasuodatin, joka käsittelee ikkunan koon muutokset
bool MainWindow::eventFilter(QObject *watched, QEvent *event)
{
    // Tarkistetaan onko kyseessä kuvakomponentti ja onko tapahtuma ikkunan koon muutos
    if (watched == ui->imgLabel && event->type() == QEvent::Resize) {
        // Ladataan alkuperäinen kuva uudelleen
        QPixmap originalPix(":/img/landing-picture.jpg");
        if (!originalPix.isNull()) {
            // Skaalataan kuva uuteen kokoon säilyttäen mittasuhteet
            ui->imgLabel->setPixmap(originalPix.scaled(ui->imgLabel->size(),
                                  Qt::KeepAspectRatio,
                                  Qt::SmoothTransformation));
        }
    }
    // Jatketaan tapahtuman käsittelyä normaalisti
    return QMainWindow::eventFilter(watched, event);
}

