#include "environment.h" //ympäristön määrittelyt
#include "login.h"
#include "ui_login.h"




Login::Login(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Login)      //alustetaan  käyttöliittymä
{
    ui->setupUi(this);
    QTimer *timer =new QTimer(this);    //luodaan ajastin
    connect(timer,SIGNAL(timeout()),this,SLOT(showTime())); // Yhdistetään ajastin näyttämään aika
    timer->start(1000);

    showTime(); //näytetään aika
}

Login::~Login()
{
    delete ui;
}

void Login::on_btnLogin_clicked() //painetaan login-nappia
{
    QJsonObject jsonObj; //luodaan JSON-objekti
    jsonObj.insert("card_number",ui->text_card_number->text()); //lisätään kortin numero
    jsonObj.insert("pin",ui->text_pin->text()); //lisätään pin-koodi

    QString site_url=Environment::base_url()+"/login"; //rakennetaan palvelimen URL
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader,"application/json");
    loginManager = new QNetworkAccessManager(this);  // Luodaan verkon hallintaja
    connect(loginManager,SIGNAL(finished(QNetworkReply*)),this,SLOT(loginSlot(QNetworkReply*))); // Yhdistetään vastaus
    reply = loginManager->post(request, QJsonDocument(jsonObj).toJson()); // Lähetetään POST-pyyntö
}

// Kirjautumisvastauksen käsittely

void Login::loginSlot(QNetworkReply *reply)
{
    response_data=reply->readAll();  // Luetaan vastausdata
      if(response_data.length()<2){ // Jos palvelin ei vastaa
        qDebug()<<"Palvelin ei vastaa";
          ui->labelInfo->setText("Palvelin ei vastaa!");
      }
      else {
          if(response_data=="-11"){
              ui->labelInfo->setText("Tietokantavirhe!");
          }
          else {
              if(response_data!="false" && response_data.length()>20) { // Onnistunut kirjautuminen
                  ui->labelInfo->setText("Kirjautuminen OK");

                  static int i=1; // Vaihdetaan näkymää
                  ui->stackedWidget->setCurrentIndex(i); // Asetetaan uusi näkymä
              }
              else {
                  ui->labelInfo->setText("Väärä tunnus/salasana"); // Väärä tunnus tai salasana
              }

          }
      }
    reply->deleteLater();
    loginManager->deleteLater();
}

// Näytetään nykyinen aika LCD-näytöllä
void Login::showTime()
{
    QTime time =QTime ::currentTime();// Haetaan nykyinen aika
    QString text = time.toString("hh:mm");// Muutetaan aika oikeaan muotoon
    if((time.second()%2)==0) // Vaihdetaan näytettävän ajan kolmas merkki
        text[2]=' '; // Tyhjennetään minuutin ja sekunnin välinen merkki
    ui-> lcd->display(text); // Näytetään aika LCD-näytöllä

}

// Nappi, joka siirtää näkymän luottoa varten
void Login::on_btn_credit_clicked()
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);
}

// Nappi, joka siirtää näkymän pankkikorttia varten
void Login::on_btn_debit_clicked()
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);
}

// Nappi, joka siirtää näkymän balancelle
void Login::on_btn_balance_clicked()
{
    static int i=5; // Asetetaan näkymän indeksiksi 5, Vaihdetaan näkymää, Haetaan tili saldo palvelimelta
    ui->stackedWidget->setCurrentIndex(i); QString site_url = Environment::base_url() + "/balance";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    balanceManager = new QNetworkAccessManager(this); // Luodaan verkon hallintaja
    connect(balanceManager, SIGNAL(finished(QNetworkReply*)), this, SLOT(handleBalanceResponse(QNetworkReply*)));// Yhdistetään vastaus
    balanceManager->get(request); // Lähetetään GET-pyyntö
}

// Käsitellään saldo-vastaus
void Login::handleBalanceResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll();  // Luetaan vastausdata
    if (response_data.isEmpty()) { // Jos saldoa ei saatu
        ui->label_balance_2->setText("Balance retrieval failed!");
    } else {
        ui->label_balance_2->setText("Balance: " + QString(response_data));// Näytetään saldo
    }
    reply->deleteLater(); // Vapautetaan vastaus
    balanceManager->deleteLater(); //Vapautetaan verkon hallintaja
}


// Nappi, joka siirtää näkymän tapahtumille

void Login::on_btn_transactions_clicked()
{
    static int i=3;// Asetetaan näkymän indeksiksi 3
    ui->stackedWidget->setCurrentIndex(i); // Vaihdetaan näkymää
    QString site_url = Environment::base_url() + "/transactions"; // Haetaan tapahtumat palvelimelta
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    transactionsManager = new QNetworkAccessManager(this);// Luodaan verkon hallintaja
    connect(transactionsManager, SIGNAL(finished(QNetworkReply*)), this, SLOT(handleTransactionsResponse(QNetworkReply*))); // Yhdistetään vastaus
    transactionsManager->get(request);   // Lähetetään GET-pyyntö
}

// Käsitellään tapahtumavastaus
void Login::handleTransactionsResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll(); // Luetaan vastausdata
    QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);  // Parsitaan JSON-vastaus
    QJsonArray transactionsArray = jsonResponse.array(); // Haetaan tapahtumat

    if (transactionsArray.isEmpty()) { // Jos ei ole tapahtumia
        ui->lbl_transactions->setText("No transactions found!");
    } else {
        QString transactionText = "Transactions:\n";
        for (const QJsonValue &transaction : transactionsArray) { // Käydään kaikki tapahtumat läpi
            QJsonObject obj = transaction.toObject();
            transactionText += obj["date"].toString() + " - " +
                               obj["amount"].toString() + "€\n"; // Näytetään tapahtuma
        }
        ui->lbl_transactions->setText(transactionText); // Näytetään kaikki tapahtumat
    }

    reply->deleteLater();// Vapautetaan vastaus
    transactionsManager->deleteLater(); // Vapautetaan verkon hallintaja
}


 // tässä metodissa tarkastetaan, että käyttäjä on syöttänytt summan, ja jos summa on syötetty.> verkkopyyntö> summan lähettäminen ja pyynnön vastauksen käsittely.
void Login::makeWithdrawal() {
    // Haetaan syötetty summa käyttöliittymästä (lineEdit_sum)
    QString amount = ui->lineEdit_sum->text();
    // Tarkistetaan, että käyttäjä on syöttänyt summan
    if (amount.isEmpty()) {
          // Jos summa on tyhjä, ilmoitetaan käyttäjälle, että summa pitää syöttää
        ui->withdrawllabel->setText("Enter amount!"); // Lopetetaan funktio, jos summa puuttuu
        return;
    }
// Luodaan JSON-objekti, joka sisältää summan
    QJsonObject jsonObj;
    jsonObj.insert("amount", amount); // Lisätään "amount" kenttä JSON-objektiin
 // Rakennetaan URL-osoite, johon pyyntö lähetetään
    QString site_url = Environment::base_url() + "/withdraw";
    QNetworkRequest request(site_url); // Luodaan verkkopyyntö
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json"); // Määritetään sisällön tyyppi (JSON)
// Luodaan QNetworkAccessManager, joka huolehtii verkkopyynnöistä
    QNetworkAccessManager *withdrawalManager = new QNetworkAccessManager(this);
    // Liitetään signaali (finished) ja slot (handleWithdrawalResponse) niin, että kun pyyntö on valmis, käsitellään vastaus
    connect(withdrawalManager, &QNetworkAccessManager::finished, this, &Login::handleWithdrawalResponse);
      // Lähetetään JSON-objekti POST-pyynnön mukana
    withdrawalManager->post(request, QJsonDocument(jsonObj).toJson());
}



void Login::on_btn_withdrawal_clicked() //painetaan nosto-nappia
{
    static int i=4;
    ui->stackedWidget->setCurrentIndex(i);
    QString amount = ui->lineEdit_sum->text();
    if (amount.isEmpty()) {
        ui->withdrawllabel->setText("Enter amount!");
        return;
    }

    QJsonObject jsonObj;
    jsonObj.insert("amount", amount);

    QString site_url = Environment::base_url() + "/withdraw";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    withdrawalManager = new QNetworkAccessManager(this);
    connect(withdrawalManager, SIGNAL(finished(QNetworkReply*)), this, SLOT(handleWithdrawalResponse(QNetworkReply*)));
    withdrawalManager->post(request, QJsonDocument(jsonObj).toJson());
}


// Käsitellään nostovastaus
void Login::handleWithdrawalResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll(); // Luetaan vastausdata
    QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data); // Parsitaan JSON-vastaus
    QJsonObject jsonObj = jsonResponse.object(); // Haetaan JSON-objekti

    if (jsonObj.contains("status") && jsonObj["status"].toString() == "success") { // Jos nosto onnistui
        ui->withdrawllabel->setText("Withdrawal successful!");
    } else { // Jos nosto epäonnistui
        ui->withdrawllabel->setText("Withdrawal failed!");
    }

    reply->deleteLater(); // Vapautetaan vastaus
    withdrawalManager->deleteLater(); // Vapautetaan verkon hallintaja
}

//hyväksytään nosto
void Login::on_btn_confirm_clicked()
{

    QString amount = ui->lineEdit_sum->text();// Haetaan nosto-summa
    if (amount.isEmpty()) {  // summa on tyhjä
        ui->withdrawllabel->setText("Please enter an amount!");
        return;
    }


    bool ok;
    double amountValue = amount.toDouble(&ok); // Tarkistetaan, että summa on kelvollinen
    if (!ok || amountValue <= 0) {
        ui->withdrawllabel->setText("Invalid amount entered!");// Virheilmoitus jos summa ei ole kelvollinen
        return;
    }


    QJsonObject jsonObj;
    jsonObj.insert("amount", amount); // Lisätään summa JSON-objektiin

    QString site_url = Environment::base_url() + "/withdraw";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    QNetworkAccessManager *withdrawalManager = new QNetworkAccessManager(this);
    connect(withdrawalManager, &QNetworkAccessManager::finished, this, &Login::handleWithdrawalResponse);// Yhdistetään vastaus
    withdrawalManager->post(request, QJsonDocument(jsonObj).toJson()); // Lähetetään POST-pyyntö

    ui->withdrawllabel->setText("Processing withdrawal...");  // Näytetään, että nosto on käsittelyssä
}



void Login::on_btn_back_clicked() //palaa takaisin
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);

}

// Peruuta-nappi (palaa päävalikkoon)
void Login::on_btn_cancel_clicked()
{
    static int i=0;
    ui->stackedWidget->setCurrentIndex(i);
}

// Summien napit

void Login::on_btn_20_clicked()
{
    ui->lineEdit_sum->setText("20");
}


void Login::on_btn_40_clicked()
{
ui->lineEdit_sum->setText("40");
}


void Login::on_btn_50_clicked()
{
ui->lineEdit_sum->setText("50");
}


void Login::on_btn_100_clicked()
{
ui->lineEdit_sum->setText("100");
}

// Kirjaudu ulos
void Login::on_btnLogout_clicked()
{
    ui->labelInfo->setText("You have been logged out!"); // Ilmoitus uloskirjautumisesta
    ui->stackedWidget->setCurrentIndex(0); // Palataan päävalikkoon
}

