#ifndef LOGIN_H
#define LOGIN_H

#include <QMainWindow>
#include <QtNetwork>
#include <QNetworkAccessManager>
#include <QJsonDocument>
#include <QStackedWidget>
#include <QWidget>
#include <QTimer>
#include <QLabel>
#include <QPixmap>
#include "mainwindow.h"

// Määritellään käyttöliittymänimiavaruus
namespace Ui {
class Login;
}

// Login-luokka hallinnoi pankkiautomaatin päänäkymää
class Login : public QMainWindow
{
    Q_OBJECT

private:
    // Näkymien indeksit enum-tyypillä selkeyden vuoksi
    enum Views {
        LOGIN_VIEW = 0,           // Kirjautumisnäkymä
        ACCOUNT_SELECT_VIEW = 1,  // Tilinvalintanäkymä
        MAIN_MENU_VIEW = 2,       // Päävalikko
        TRANSACTIONS_VIEW = 3,    // Tapahtumahistoria
        WITHDRAWAL_VIEW = 4,      // Noston näkymä
        BALANCE_VIEW = 5          // Saldon näkymä
    };

public:
    // Konstruktori, joka alustaa käyttöliittymän
    explicit Login(QWidget *parent = nullptr);
    // Destruktori, joka vapauttaa resurssit
    ~Login();

private:
    Ui::Login *ui;                   // Osoitin käyttöliittymäkomponentteihin
    QNetworkAccessManager *apiManager; // Verkkopyyntöjen hallinta
    QString authToken;               // JWT-tunniste autentikointia varten
    QString currentAccountType;      // Nykyinen tilityyppi (debit/credit)
    QByteArray sessionCookie;        // Istunnon eväste
    QNetworkReply *reply;           // Verkkopyynnön vastaus
    QByteArray response_data;        // Vastauksen data
    static int i;                    // Staattinen laskuri
    int currentTransactionPage;      // Nykyinen tapahtumahistorian sivu
    bool hasNextPage;               // Onko seuraava sivu saatavilla
    QString currentUserImage;        // Käyttäjän kuvan polku
    QString currentUserFullName;     // Käyttäjän koko nimi
    QTimer *logoutTimer;            // Automaattisen uloskirjautumisen ajastin
    QPixmap userPixmap;             // Käyttäjän kuva muistissa

    // Apufunktiot
    void makeApiRequest(const QString &endpoint, const QString &method, const QByteArray &data);
    void loadTransactions();         // Lataa tapahtumahistorian
    void updateTransactionButtons(); // Päivittää tapahtumanäkymän painikkeet
    void loadUserInfo();            // Lataa käyttäjän tiedot
    void clearUserInfo();           // Tyhjentää käyttäjän tiedot
    void updateUserInfoDisplay();    // Päivittää käyttäjän tiedot näytölle
    void resetLogoutTimer();        // Nollaa uloskirjautumisen ajastimen
    void autoLogout();              // Automaattinen uloskirjautuminen

public slots:
    void showTime();                // Näyttää kellonajan

private slots:
    // UI-tapahtumien käsittelijät
    void on_btnLogin_clicked();     // Kirjautumispainike
    void on_btn_credit_clicked();   // Luottotilin valinta
    void on_btn_debit_clicked();    // Pankkitilin valinta
    void on_btn_balance_clicked();  // Saldon tarkistus
    void on_btn_transactions_clicked();
    void makeWithdrawal();
    void handleBalanceResponse(QNetworkReply *reply);
    void handleTransactionsResponse(QNetworkReply *reply);
    void handleWithdrawalResponse(QNetworkReply *reply);
    void handleLoginResponse(QNetworkReply *reply);
    void on_btn_back_clicked();
    void on_btn_withdrawal_clicked();
    void on_btn_exit_clicked();
    void on_btn_20_clicked();
    void on_btn_40_clicked();
    void on_btn_50_clicked();
    void on_btn_100_clicked();
    void on_btnLogout_clicked();
    void on_btn_confirm_clicked();
    void handleAccountsResponse(QNetworkReply *reply);
    void requestAccounts();
    void selectAccount(const QString &accountType);
    void on_btn_next_page_clicked();
    void on_btn_prev_page_clicked();
    void on_stackedWidget_currentChanged(int index);
};

#endif // LOGIN_H
