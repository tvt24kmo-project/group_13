#include "environment.h" // ympäristön määrittelyt
#include "login.h"
#include "ui_login.h"

Login::Login(QWidget *parent)
    : QMainWindow(parent)  // Vaihdettu QDialog -> QMainWindow
    , ui(new Ui::Login) // alustetaan käyttöliittymä
{
    ui->setupUi(this);
    setWindowFlags(Qt::Window | Qt::WindowMinMaxButtonsHint | Qt::WindowCloseButtonHint);  // Lisätään kaikki tarvittavat liput
    setWindowState(Qt::WindowActive);  // Asetetaan ikkuna aktiiviseksi
    QTimer *timer = new QTimer(this); // luodaan ajastin
    connect(timer, SIGNAL(timeout()), this, SLOT(showTime())); // Yhdistetään ajastin näyttämään aika
    timer->start(1000);

    // Luodaan yksi apiManager koko sovelluksen elinkaaren ajaksi
    apiManager = new QNetworkAccessManager(this);
    apiManager->setCookieJar(new QNetworkCookieJar(apiManager));

    showTime(); // näytetään aika

    // Lisää logout timer
    logoutTimer = new QTimer(this);
    logoutTimer->setSingleShot(true);
    connect(logoutTimer, &QTimer::timeout, this, &Login::autoLogout);
}

Login::~Login()
{
    delete ui;
}

void Login::on_btnLogin_clicked()
{
    QString cardNumber = ui->text_card_number->text();
    QString pin = ui->text_pin->text();

    // Tarkista että korttinumero on syötetty
    if (cardNumber.isEmpty()) {
        ui->labelInfo->setText("Please enter card number");
        return;
    }

    // Tarkista että PIN on syötetty ja on vähintään 4 merkkiä
    if (pin.isEmpty()) {
        ui->labelInfo->setText("Please enter PIN code");
        return;
    }

    if (pin.length() < 4) {
        ui->labelInfo->setText("PIN must be at least 4 digits");
        ui->text_pin->clear();
        return;
    }

    // Jos tarkistukset ok, jatka kirjautumiseen
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    
    QJsonObject jsonObj;
    jsonObj.insert("card_number", cardNumber);
    jsonObj.insert("pin", pin);

    QString site_url = Environment::base_url() + "/card_login";
    
    qDebug() << "Sending login request to:" << site_url;
    qDebug() << "Request data:" << QJsonDocument(jsonObj).toJson();

    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    
    // Yhdistetään handleLoginResponse
    connect(apiManager, &QNetworkAccessManager::finished, this, &Login::handleLoginResponse);
    apiManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::handleLoginResponse(QNetworkReply *reply)
{
    if (reply->error() == QNetworkReply::NoError) {
        // Onnistunut kirjautuminen
        QByteArray response_data = reply->readAll();
        QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
        QJsonObject jsonObj = jsonResponse.object();

        if (jsonObj.contains("token")) {
            authToken = jsonObj["token"].toString();
            currentAccountType.clear();
            ui->labelInfo->setText("Login successful");
            
            // Tallennetaan session cookie (vain kerran)
            QList<QNetworkCookie> cookies = apiManager->cookieJar()->cookiesForUrl(QUrl(Environment::base_url()));
            for (const QNetworkCookie &cookie : cookies) {
                if (cookie.name() == "connect.sid") {
                    sessionCookie = cookie.toRawForm();
                    qDebug() << "Session cookie saved:" << sessionCookie;
                }
            }

            requestAccounts();
        }
    } else {
        // Käsitellään virhetilanteet HTTP-koodin mukaan
        int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        QByteArray response_data = reply->readAll();
        QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
        QJsonObject jsonObj = jsonResponse.object();
        QString errorMessage = jsonObj["message"].toString();

        switch(httpStatus) {
            case 401:
                ui->labelInfo->setText("Incorrect PIN");
                break;
            case 403:
                ui->labelInfo->setText("Card is locked\nToo many incorrect attempts");
                break;
            case 500:
                ui->labelInfo->setText("System error\nPlease try again later");
                break;
            default:
                ui->labelInfo->setText("Login failed");
                break;
        }

        // Tyhjennä PIN-kenttä virhetilanteessa
        ui->text_pin->clear();
    }

    reply->deleteLater();
}

void Login::requestAccounts()
{
    QString site_url = Environment::base_url() + "/atm/accounts";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    qDebug() << "Requesting accounts from:" << site_url;
    qDebug() << "Using token:" << authToken;
    qDebug() << "Using cookie:" << sessionCookie;

    // Varmistetaan että vain handleAccountsResponse käsittelee vastauksen
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    connect(apiManager, &QNetworkAccessManager::finished, this, &Login::handleAccountsResponse);
    
    apiManager->get(request);
}

void Login::handleAccountsResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll();
    qDebug() << "Accounts response:" << response_data;

    if (reply->error() != QNetworkReply::NoError) {
        qDebug() << "Network error:" << reply->errorString();
        ui->labelInfo->setText("Error loading accounts");
        reply->deleteLater();
        return;
    }

    QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
    if (!jsonResponse.isArray()) {
        qDebug() << "Response is not an array";
        ui->labelInfo->setText("Invalid response format");
        reply->deleteLater();
        return;
    }

    QJsonArray accountsArray = jsonResponse.array();
    qDebug() << "Found" << accountsArray.size() << "accounts";

    if (accountsArray.isEmpty()) {
        ui->labelInfo->setText("No accounts found!");
        reply->deleteLater();
        return;
    }

    // Tarkistetaan tilityypit
    bool hasDebit = false;
    bool hasCredit = false;

    for (const QJsonValue &account : accountsArray) {
        QString accountType = account.toObject()["account_type"].toString();
        qDebug() << "Found account type:" << accountType;

        if (accountType == "debit") hasDebit = true;
        if (accountType == "credit") hasCredit = true;
    }

    qDebug() << "Account summary - Debit:" << hasDebit << "Credit:" << hasCredit;

    // Logiikka eri tilanteille:
    if (hasDebit && hasCredit) {
        // Jos molemmat tilityypit -> näytetään valintasivu
        qDebug() << "Both account types found, showing selection view";
        ui->stackedWidget->setCurrentIndex(ACCOUNT_SELECT_VIEW);
    } else if (hasDebit) {
        // Jos vain debit -> valitaan se automaattisesti
        qDebug() << "Only debit found, auto-selecting";
        selectAccount("debit");
    } else if (hasCredit) {
        // Jos vain credit -> valitaan se automaattisesti
        qDebug() << "Only credit found, auto-selecting";
        selectAccount("credit");
    } else {
        // Tämän ei pitäisi tapahtua, koska tarkistimme jo isEmpty
        qDebug() << "No valid account types found!";
        ui->labelInfo->setText("No valid accounts found!");
    }

    reply->deleteLater();
}

void Login::selectAccount(const QString &accountType)
{
    QJsonObject jsonObj;
    jsonObj.insert("account_type", accountType);

    QString site_url = Environment::base_url() + "/atm/select-account";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    // Poistetaan kaikki vanhat yhteydet ennen uuden luomista
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    
    // Luodaan uusi yhteys vain selectAccount-vastaukselle
    connect(apiManager, &QNetworkAccessManager::finished, this, [this, accountType](QNetworkReply *reply) {
        QByteArray response_data = reply->readAll();
        qDebug() << "Select account response:" << response_data;

        QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
        QJsonObject jsonObj = jsonResponse.object();

        if (jsonObj.contains("message") && jsonObj["message"].toString() == "Account selected successfully") {
            ui->labelInfo->setText("Account selected successfully");
            currentAccountType = accountType;
            
            // TÄRKEÄ MUUTOS: Haetaan käyttäjän tiedot ennen päävalikkoon siirtymistä
            disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
            loadUserInfo();
            qDebug() << "Waiting for user data...";
            
            resetLogoutTimer();  // Käynnistä ajastin kun kirjautuminen onnistuu
            
        } else {
            ui->labelInfo->setText("Account selection failed");
        }

        reply->deleteLater();
    });

    apiManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::showTime()
{
    QTime time = QTime::currentTime(); // Haetaan nykyinen aika
    QString text = time.toString("hh:mm"); // Muutetaan aika oikeaan muotoon
    if ((time.second() % 2) == 0) // Vaihdetaan näytettävän ajan kolmas merkki
        text[2] = ' '; // Tyhjennetään minuutin ja sekunnin välinen merkki
    ui->lcd->display(text); // Näytetään aika LCD-näytöllä
}

// Nappi, joka siirtää näkymän luottoa varten
void Login::on_btn_credit_clicked()
{
    selectAccount("credit"); // Valitaan luottotili
}

// Nappi, joka siirtää näkymän pankkikorttia varten
void Login::on_btn_debit_clicked()
{
    selectAccount("debit"); // Valitaan pankkitili
}

// Nappi, joka siirtää näkymän balancelle
void Login::on_btn_balance_clicked()
{
    resetLogoutTimer();
    ui->stackedWidget->setCurrentIndex(BALANCE_VIEW);
    QString site_url = Environment::base_url() + "/atm/balance";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    // Poistetaan vanhat yhteydet
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    connect(apiManager, &QNetworkAccessManager::finished, this, &Login::handleBalanceResponse);
    apiManager->get(request);
}

void Login::handleBalanceResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll();
    qDebug() << "Balance response raw data:" << response_data;
    
    if (reply->error() != QNetworkReply::NoError) {
        if (reply->error() == QNetworkReply::AuthenticationRequiredError) {
            ui->label_balance_2->setText("Session expired\nPlease login again");
        } else {
            ui->label_balance_2->setText("Unable to retrieve balance\nPlease try again");
        }
        reply->deleteLater();
        return;
    }

    QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
    if (!jsonResponse.isObject()) {
        qDebug() << "Response is not a valid JSON object";
        ui->label_balance_2->setText("Invalid response format");
        reply->deleteLater();
        return;
    }

    QJsonObject jsonObj = jsonResponse.object();

    if (jsonObj.contains("balance")) {
        QString balanceStr = jsonObj["balance"].toString();
        QString formattedBalance = QString("%1 €").arg(balanceStr);
        QString displayText;

        if (jsonObj.contains("available_credit")) {
            double creditAmount = jsonObj["available_credit"].toDouble();
            QString creditStr = QString::number(creditAmount, 'f', 2);
            displayText = QString("<div style='text-align: center;'>"
                                "<div style='font-size: 28px; margin-bottom: 20px;'>"
                                "<span style='color: black;'>Balance: </span>"
                                "<span style='color: %1;'>%2</span>"
                                "</div>"
                                "<div style='font-size: 24px;'>"
                                "<span style='color: black;'>Available Credit: </span>"
                                "<span style='color: #2196F3;'>%3 €</span>"
                                "</div></div>")
                                .arg(balanceStr.contains("-") ? "#f44336" : "#4CAF50")
                                .arg(formattedBalance)
                                .arg(creditStr);
        } else {
            displayText = QString("<div style='text-align: center; font-size: 28px;'>"
                                "<span style='color: black;'>Balance: </span>"
                                "<span style='color: %1;'>%2</span></div>")
                                .arg(balanceStr.contains("-") ? "#f44336" : "#4CAF50")
                                .arg(formattedBalance);
        }

        ui->label_balance_2->setText(displayText);
        ui->label_balance_2->setTextFormat(Qt::RichText);
    } else {
        ui->label_balance_2->setText("Balance information not available");
    }

    reply->deleteLater();
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
}

void Login::on_btn_transactions_clicked()
{
    resetLogoutTimer();
    ui->stackedWidget->setCurrentIndex(TRANSACTIONS_VIEW);
    currentTransactionPage = 1;  // Aloitetaan aina sivulta 1
    hasNextPage = true;  // Oletetaan aluksi että seuraava sivu on saatavilla
    
    // Poistetaan vanhat yhteydet
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    
    loadTransactions();
}

void Login::loadTransactions()
{
    qDebug() << "Loading transactions page:" << currentTransactionPage;
    
    // Rakennetaan pyyntö
    QString site_url = Environment::base_url() + "/atm/transactions";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    // Luodaan data
    QJsonObject jsonObj;
    jsonObj.insert("page", currentTransactionPage);
    
    // Yhdistetään handleTransactionsResponse
    connect(apiManager, &QNetworkAccessManager::finished, this, &Login::handleTransactionsResponse);
    
    // Lähetetään pyyntö
    apiManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::handleTransactionsResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll();
    qDebug() << "Transactions response raw data:" << response_data;

    if (reply->error() != QNetworkReply::NoError) {
        if (reply->error() == QNetworkReply::AuthenticationRequiredError) {
            ui->lbl_transactions->setText("Session expired\nPlease login again");
        } else {
            ui->lbl_transactions->setText("Unable to load transactions\nPlease try again");
        }
        reply->deleteLater();
        return;
    }

    QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
    if (!jsonResponse.isArray()) {
        qDebug() << "Response is not a valid JSON array";
        ui->lbl_transactions->setText("Invalid response format");
        reply->deleteLater();
        return;
    }

    QJsonArray transactionsArray = jsonResponse.array();
    qDebug() << "Found" << transactionsArray.size() << "transactions";

    // Tyhjennä taulukko
    ui->tableWidget_transactions->clear();
    ui->tableWidget_transactions->setRowCount(0);
    
    // Asetetaan kolme saraketta
    ui->tableWidget_transactions->setColumnCount(3);
    ui->tableWidget_transactions->setHorizontalHeaderLabels({"Date", "Type", "Amount (€)"});
    
    if (transactionsArray.isEmpty()) {
        if (currentTransactionPage > 1) {
            currentTransactionPage--;
            loadTransactions();
        } else {
            ui->lbl_transactions->setText("No transactions found");
        }
        hasNextPage = false;
    } else {
        ui->lbl_transactions->setText("Transaction History");
        
        for (const QJsonValue &transaction : transactionsArray) {
            QJsonObject obj = transaction.toObject();
            
            // Muunna UTC aika paikalliseksi ajaksi
            QDateTime utcDateTime = QDateTime::fromString(obj["date"].toString(), Qt::ISODate);
            utcDateTime.setTimeSpec(Qt::UTC);  // Kerrotaan että aika on UTC:ssä
            QDateTime localDateTime = utcDateTime.toLocalTime();  // Muunnetaan paikalliseksi ajaksi
            QString formattedDate = localDateTime.toString("dd.MM.yyyy HH:mm");
            
            QString sum = obj["sum"].toString();
            QString type = obj["type"].toString();
            
            int row = ui->tableWidget_transactions->rowCount();
            ui->tableWidget_transactions->insertRow(row);
            
            // Aseta päivämäärä
            QTableWidgetItem *dateItem = new QTableWidgetItem(formattedDate);
            dateItem->setTextAlignment(Qt::AlignCenter);
            dateItem->setBackground(QBrush(QColor("#ffffff")));
            ui->tableWidget_transactions->setItem(row, 0, dateItem);
            
            // Aseta transaktiotyyppi
            QTableWidgetItem *typeItem = new QTableWidgetItem(type);
            typeItem->setTextAlignment(Qt::AlignCenter);
            typeItem->setBackground(QBrush(QColor("#ffffff")));
            ui->tableWidget_transactions->setItem(row, 1, typeItem);
            
            // Aseta summa ja väritä sen mukaan
            QTableWidgetItem *sumItem = new QTableWidgetItem(sum + " €");
            sumItem->setTextAlignment(Qt::AlignCenter);
            sumItem->setBackground(QBrush(QColor("#ffffff")));
            
            if (sum.contains("-")) {
                sumItem->setForeground(QBrush(QColor("#f44336"))); // Punainen
            } else {
                sumItem->setForeground(QBrush(QColor("#4CAF50"))); // Vihreä
            }
            
            ui->tableWidget_transactions->setItem(row, 2, sumItem);
        }

        hasNextPage = (transactionsArray.size() == 10);
    }

    // Säädä rivien korkeus ja sarakeleveydet
    ui->tableWidget_transactions->setVerticalScrollBarPolicy(Qt::ScrollBarAsNeeded);
    ui->tableWidget_transactions->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableWidget_transactions->horizontalHeader()->setSectionResizeMode(1, QHeaderView::Fixed);
    ui->tableWidget_transactions->horizontalHeader()->setSectionResizeMode(2, QHeaderView::Stretch);
    
    ui->tableWidget_transactions->setColumnWidth(0, 200); // Päivämäärälle kiinteä leveys
    ui->tableWidget_transactions->setColumnWidth(1, 100); // Tyypille kiinteä leveys
    
    for (int i = 0; i < ui->tableWidget_transactions->rowCount(); i++) {
        ui->tableWidget_transactions->setRowHeight(i, 40);
    }
    
    updateTransactionButtons();
    reply->deleteLater();
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
}

void Login::on_btn_next_page_clicked()
{
    currentTransactionPage++;
    loadTransactions();
}

void Login::on_btn_prev_page_clicked()
{
    if (currentTransactionPage > 1) {
        currentTransactionPage--;
        loadTransactions();
    }
}

void Login::updateTransactionButtons()
{
    // Päivitä "Previous" painikkeen tila
    ui->btn_prev_page->setEnabled(currentTransactionPage > 1);
    
    // Jos painike on disabloitu, näytä se harmaana
    if (currentTransactionPage > 1) {
        ui->btn_prev_page->setStyleSheet("background-color: rgb(255, 255, 255);");
    } else {
        ui->btn_prev_page->setStyleSheet("background-color: rgb(200, 200, 200);");
    }
    
    // Päivitä "Next" painikkeen tila
    ui->btn_next_page->setEnabled(hasNextPage);
    if (hasNextPage) {
        ui->btn_next_page->setStyleSheet("background-color: rgb(255, 255, 255);");
    } else {
        ui->btn_next_page->setStyleSheet("background-color: rgb(200, 200, 200);");
    }
}

// tässä metodissa tarkastetaan, että käyttäjä on syöttänyt summan, ja jos summa on syötetty.> verkkopyyntö> summan lähettäminen ja pyynnön vastauksen käsittely.
void Login::makeWithdrawal()
{
    resetLogoutTimer();
    // Haetaan syötetty summa käyttöliittymästä (lineEdit_sum)
    QString amount = ui->lineEdit_sum->text();
    // Tarkistetaan, että käyttäjä on syöttänyt summan
    if (amount.isEmpty()) {
        ui->withdrawllabel->setText("Please enter withdrawal amount");
        return;
    }
    if (amount.toInt() <= 0) {
        ui->withdrawllabel->setText("Amount must be greater than zero");
        return;
    }
    // Luodaan JSON-objekti, joka sisältää summan
    QJsonObject jsonObj;
    jsonObj.insert("amount", amount); // Lisätään "amount" kenttä JSON-objektiin
    // Rakennetaan URL-osoite, johon pyyntö lähetetään
    QString site_url = Environment::base_url() + "/atm/withdraw";
    QNetworkRequest request(site_url); // Luodaan verkkopyyntö
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json"); // Määritetään sisällön tyyppi (JSON)
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8()); // Lisätään Bearer token
    request.setRawHeader("Cookie", sessionCookie);

    // Liitetään signaali (finished) ja slot (handleWithdrawalResponse) niin, että kun pyyntö on valmis, käsitellään vastaus
    connect(apiManager, &QNetworkAccessManager::finished, this, &Login::handleWithdrawalResponse);
    // Lähetetään JSON-objekti POST-pyynnön mukana
    apiManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::handleWithdrawalResponse(QNetworkReply *reply)
{
    QByteArray response_data = reply->readAll();
    qDebug() << "Withdrawal response:" << response_data;
    qDebug() << "HTTP Status:" << reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();

    // Tarkista HTTP status code
    int httpStatus = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
    
    if (httpStatus == 200) {
        // Nosto onnistui
        ui->withdrawllabel->setText("Withdrawal successful!");
        ui->lineEdit_sum->clear();
        
        // Näytä onnistumisilmoitus 2 sekuntia ja palaa päävalikkoon
        QTimer::singleShot(2000, [this]() {
            ui->withdrawllabel->clear();
            ui->stackedWidget->setCurrentIndex(MAIN_MENU_VIEW);
        });
    } else {
        // Tulkitse virheviesti vastauksesta
        QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
        QString errorMessage = "Withdrawal failed";
        
        if (!jsonResponse.isNull() && jsonResponse.isObject()) {
            QJsonObject jsonObj = jsonResponse.object();
            if (jsonObj.contains("message")) {
                errorMessage = jsonObj["message"].toString();
            }
        }
        
        ui->withdrawllabel->setText(errorMessage);
    }

    reply->deleteLater();
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    resetLogoutTimer();
}

void Login::on_btn_confirm_clicked()
{
    makeWithdrawal(); // Kutsutaan makeWithdrawal-funktiota
}

void Login::on_btn_back_clicked() // palaa takaisin
{
    ui->stackedWidget->setCurrentIndex(MAIN_MENU_VIEW); // Käytetään enum arvoa
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
    QString site_url = Environment::base_url() + "/atm/logout";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    // Poistetaan vanhat yhteydet
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    
    // Luodaan uusi yhteys vain logout-vastaukselle
    connect(apiManager, &QNetworkAccessManager::finished, this, [this](QNetworkReply *reply) {
        QByteArray response_data = reply->readAll();
        qDebug() << "Logout response:" << response_data;

        QJsonDocument jsonResponse = QJsonDocument::fromJson(response_data);
        QJsonObject jsonObj = jsonResponse.object();

        if (jsonObj.contains("message") && jsonObj["message"].toString() == "Logout successful") {
            ui->labelInfo->setText("You have been logged out!");
            
            // Tyhjennetään kaikki tiedot kuten ennenkin
            clearUserInfo();
            authToken.clear();
            currentAccountType.clear();
            sessionCookie.clear();
            ui->text_card_number->clear();
            ui->text_pin->clear();
            
            // Pysäytä logout timer
            logoutTimer->stop();
            
            // Luo uusi MainWindow ja näytä se
            MainWindow *mainWindow = new MainWindow();
            mainWindow->show();
            
            // Sulje tämä ikkuna
            this->close();
        } else {
            ui->labelInfo->setText("Logout failed");
        }

        reply->deleteLater();
        
        // Poistetaan tämä yhteys
        disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    });

    apiManager->post(request, QByteArray());
    clearUserInfo();
}

void Login::on_btn_withdrawal_clicked() // painetaan nosto-nappia
{
    resetLogoutTimer();
    ui->stackedWidget->setCurrentIndex(4); // Withdrawal view (index 4)
}

void Login::makeApiRequest(const QString &endpoint, const QString &method, const QByteArray &data)
{
    QNetworkRequest request(Environment::base_url() + endpoint);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-www-form-urlencoded");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    if (method == "GET") {
        apiManager->get(request);
    } else if (method == "POST") {
        apiManager->post(request, data);
    }
}

// Ohjelman lopetus
void Login::on_btn_exit_clicked()
{
    clearUserInfo();
    // Tyhjennetään kaikki käyttäjädata
    authToken.clear();
    currentAccountType.clear();
    sessionCookie.clear();
    ui->text_card_number->clear();
    ui->text_pin->clear();
    
    // Tyhjennetään cookie jar
    apiManager->setCookieJar(new QNetworkCookieJar(apiManager));
    
    // Katkaistaan kaikki verkkoyhteydet
    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    
    // Jos käyttäjä on kirjautunut sisään, lähetetään logout-pyyntö
    if (!authToken.isEmpty()) {
        QNetworkRequest request(Environment::base_url() + "/atm/logout");
        request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
        request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
        request.setRawHeader("Cookie", sessionCookie);
        apiManager->post(request, QByteArray());
    }
    
    // Suljetaan sovellus
    QCoreApplication::quit();
}

void Login::loadUserInfo() {
    QString site_url = Environment::base_url() + "/atm/getUserData";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
    request.setRawHeader("Cookie", sessionCookie);

    qDebug() << "Requesting user data from:" << site_url;
    qDebug() << "Using token:" << authToken;

    disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
    connect(apiManager, &QNetworkAccessManager::finished, this, [this](QNetworkReply *reply) {
        if (reply->error() == QNetworkReply::NoError) {
            QByteArray responseData = reply->readAll();
            qDebug() << "User data response:" << responseData;
            
            QJsonDocument jsonResponse = QJsonDocument::fromJson(responseData);
            QJsonObject jsonObj = jsonResponse.object();
            
            // Päivitä käyttäjätiedot vain jos ne ovat saatavilla
            if (jsonObj.contains("firstname") && jsonObj.contains("lastname")) {
                currentUserFullName = jsonObj["firstname"].toString() + " " + jsonObj["lastname"].toString();
                currentUserImage = jsonObj["pic_path"].toString();
                
                qDebug() << "User name:" << currentUserFullName;
                qDebug() << "User image:" << currentUserImage;
                
                updateUserInfoDisplay();
            }
            
            // Älä vaihda näkymää jos tämä on vain päivitys
            if (ui->stackedWidget->currentIndex() == LOGIN_VIEW || 
                ui->stackedWidget->currentIndex() == ACCOUNT_SELECT_VIEW) {
                ui->stackedWidget->setCurrentIndex(MAIN_MENU_VIEW);
            }
        } else {
            qDebug() << "Error fetching user data:" << reply->errorString();
            // Virhetilanteessakin siirrytään päävalikkoon
            ui->stackedWidget->setCurrentIndex(MAIN_MENU_VIEW);
        }
        reply->deleteLater();
    });
    apiManager->get(request);
}
void Login::updateUserInfoDisplay() 
{
    // Aseta käyttäjän nimi
    if (!currentUserFullName.isEmpty()) {
        ui->userNameLabel->setText(currentUserFullName);
    }
    
    // Jos kuva on jo ladattu, käytä sitä
    if (!userPixmap.isNull()) {
        ui->userImageLabel->setPixmap(userPixmap);
        return;
    }
    
    // Lataa kuva vain jos sitä ei ole vielä ladattu
    if (!currentUserImage.isEmpty() && currentUserImage != "NULL" && currentUserImage != "null") {
        QString imageUrl = Environment::base_url() + "/public/" + currentUserImage;
        QNetworkRequest request(imageUrl);
        request.setRawHeader("Authorization", "Bearer " + authToken.toUtf8());
        request.setRawHeader("Cookie", sessionCookie);
        
        disconnect(apiManager, &QNetworkAccessManager::finished, 0, 0);
        connect(apiManager, &QNetworkAccessManager::finished, this, [this](QNetworkReply *reply) {
            if (reply->error() == QNetworkReply::NoError) {
                QByteArray imageData = reply->readAll();
                if (!imageData.isEmpty()) {
                    if (userPixmap.loadFromData(imageData)) {
                        userPixmap = userPixmap.scaled(100, 100, Qt::KeepAspectRatio, Qt::SmoothTransformation);
                        ui->userImageLabel->setPixmap(userPixmap);
                    }
                }
            }
            reply->deleteLater();
        });
        apiManager->get(request);
    }
}

void Login::clearUserInfo() 
{
    currentUserFullName.clear();
    currentUserImage.clear();
    userPixmap = QPixmap();  // Tyhjennä tallennettu kuva
    ui->userNameLabel->clear();
    ui->userImageLabel->clear();
}

void Login::on_stackedWidget_currentChanged(int index)
{
    // Päivitä Back-napin tila näkymän vaihtuessa
    bool backEnabled = (index != LOGIN_VIEW && index != MAIN_MENU_VIEW);
    ui->btn_back->setEnabled(backEnabled);
    
    // Päivitä tyylit tilan mukaan
    if (backEnabled) {
        ui->btn_back->setStyleSheet("QPushButton { background-color: #2196F3; color: white; border-radius: 10px; padding: 10px; } QPushButton:hover { background-color: #1976D2; }");
    } else {
        ui->btn_back->setStyleSheet("QPushButton { background-color: #666666; color: white; border-radius: 10px; padding: 10px; }");
    }
    
    // Nollaa withdrawal näkymän viesti kun sinne mennään
    if (index == WITHDRAWAL_VIEW) {
        ui->withdrawllabel->clear();
        ui->lineEdit_sum->clear();
    }
    
    // Poistetaan turha kuvan päivitys
    // if (index == MAIN_MENU_VIEW) {
    //     updateUserInfoDisplay();
    // }
}

// Lisää resetLogoutTimer-funktio
void Login::resetLogoutTimer()
{
    logoutTimer->start(30000);  // 30 sekuntia = 30000 ms
}

// Lisää autoLogout-funktio
void Login::autoLogout()
{
    qDebug() << "Auto logout triggered after 3 minutes of inactivity";
    on_btnLogout_clicked();
}

