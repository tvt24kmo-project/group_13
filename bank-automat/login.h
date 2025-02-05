#ifndef LOGIN_H
#define LOGIN_H

#include <QDialog>
#include <QtNetwork>
#include <QNetworkAccessManager>
#include <QJsonDocument>
#include <QStackedWidget>
#include<QWidget>
#include <QTimer>

namespace Ui {
class Login;
}

class Login : public QDialog
{
    Q_OBJECT

public:
    explicit Login(QWidget *parent = nullptr);
    ~Login();
private:
    QNetworkAccessManager *balanceManager;
    QNetworkAccessManager *transactionsManager;
    QNetworkAccessManager *withdrawalManager;

public slots:
    void showTime();
private slots:
    void on_btnLogin_clicked();
    void loginSlot (QNetworkReply *reply);

    void on_btn_credit_clicked();

    void on_btn_debit_clicked();

    void on_btn_balance_clicked();

    void on_btn_transactions_clicked();

   // void getBalance();
   //void getTransactions();
    void makeWithdrawal();
    void handleBalanceResponse(QNetworkReply *reply);
    void handleTransactionsResponse(QNetworkReply *reply);
    void handleWithdrawalResponse(QNetworkReply *reply);



    void on_btn_back_clicked();

    void on_btn_withdrawal_clicked();

    void on_btn_cancel_clicked();

    void on_btn_20_clicked();

    void on_btn_40_clicked();

    void on_btn_50_clicked();

    void on_btn_100_clicked();

    void on_btnLogout_clicked();

    void on_btn_confirm_clicked();

private:
    Ui::Login *ui;
    QNetworkAccessManager *loginManager;
    QNetworkReply *reply;
    QByteArray response_data;
    static int i;
};

#endif // LOGIN_H
