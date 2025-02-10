#ifndef LOGIN_H
#define LOGIN_H

#include <QMainWindow>
#include <QtNetwork>
#include <QNetworkAccessManager>
#include <QJsonDocument>
#include <QStackedWidget>
#include <QWidget>
#include <QTimer>

namespace Ui {
class Login;
}

class Login : public QMainWindow
{
    Q_OBJECT

private:
    enum Views {
        LOGIN_VIEW = 0,
        ACCOUNT_SELECT_VIEW = 1,
        MAIN_MENU_VIEW = 2,
        TRANSACTIONS_VIEW = 3,
        WITHDRAWAL_VIEW = 4,
        BALANCE_VIEW = 5
    };

public:
    explicit Login(QWidget *parent = nullptr);
    ~Login();

private:
    Ui::Login *ui;
    QNetworkAccessManager *apiManager;  // Muutetaan pointteriksi
    QString authToken;
    QString currentAccountType;  // Lisätään muuttuja nykyisen tilin tyypille
    QByteArray sessionCookie;  // Lisätään sessionCookie jäsenmuuttujaksi
    QNetworkReply *reply;
    QByteArray response_data;
    static int i;
    int currentTransactionPage = 1;  // Lisätään muuttuja sivunumeron seurantaan
    bool hasNextPage = false; // Lisätään muuttuja seuraavan sivun olemassaolon seurantaan

    // Lisätään makeApiRequest apufunktio private-osioon
    void makeApiRequest(const QString &endpoint, const QString &method, const QByteArray &data);
    void loadTransactions();  // Lisätään loadTransactions private-metodeihin
    void updateTransactionButtons();  // Siirretään tämä myös private-metodeihin

public slots:
    void showTime();

private slots:
    void on_btnLogin_clicked();
    void on_btn_credit_clicked();
    void on_btn_debit_clicked();
    void on_btn_balance_clicked();
    void on_btn_transactions_clicked();
    void makeWithdrawal();
    void handleBalanceResponse(QNetworkReply *reply);
    void handleTransactionsResponse(QNetworkReply *reply);
    void handleWithdrawalResponse(QNetworkReply *reply);
    void handleLoginResponse(QNetworkReply *reply);
    void on_btn_back_clicked();
    void on_btn_withdrawal_clicked();
    void on_btn_exit_clicked();  // Muutettu "cancel" -> "exit"
    void on_btn_20_clicked();
    void on_btn_40_clicked();
    void on_btn_50_clicked();
    void on_btn_100_clicked();
    void on_btnLogout_clicked();
    void on_btn_confirm_clicked();
    void handleAccountsResponse(QNetworkReply *reply);
    void requestAccounts();
    void selectAccount(const QString &accountType);
    void on_btn_next_page_clicked();     // Lisätään slotit sivutuspainikkeille
    void on_btn_prev_page_clicked();
};

#endif // LOGIN_H
