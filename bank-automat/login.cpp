#include "environment.h"
#include "login.h"
#include "mainwindow.h"
#include "ui_login.h"

Login::Login(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Login)
{
    ui->setupUi(this);
    QTimer *timer =new QTimer(this);
    connect(timer,SIGNAL(timeout()),this,SLOT(showTime()));
    timer->start(1000);

    showTime();
}

Login::~Login()
{
    delete ui;
}

void Login::on_btnLogin_clicked()
{
    QJsonObject jsonObj;
    jsonObj.insert("card_number",ui->text_card_number->text());
    jsonObj.insert("pin",ui->text_pin->text());

    QString site_url=Environment::base_url()+"/login";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader,"application/json");
    loginManager = new QNetworkAccessManager(this);
    connect(loginManager,SIGNAL(finished(QNetworkReply*)),this,SLOT(loginSlot(QNetworkReply*)));
    reply = loginManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::loginSlot(QNetworkReply *reply)
{
    response_data=reply->readAll();
      if(response_data.length()<2){
        qDebug()<<"Palvelin ei vastaa";
          ui->labelInfo->setText("Palvelin ei vastaa!");
      }
      else {
          if(response_data=="-11"){
              ui->labelInfo->setText("Tietokantavirhe!");
          }
          else {
              if(response_data!="false" && response_data.length()>20) {
                  ui->labelInfo->setText("Kirjautuminen OK");

                  static int i=1;
                  ui->stackedWidget->setCurrentIndex(i);
              }
              else {
                  ui->labelInfo->setText("Väärä tunnus/salasana");
              }

          }
      }
    reply->deleteLater();
    loginManager->deleteLater();
}
void Login::showTime()
{
    QTime time =QTime ::currentTime();
    QString text = time.toString("hh:mm");
    if((time.second()%2)==0)
        text[2]=' ';
    ui-> lcd->display(text);

}
void Login::on_btn_credit_clicked()
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);
}


void Login::on_btn_debit_clicked()
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);
}


void Login::on_btn_balance_clicked()
{
    static int i=5;
    ui->stackedWidget->setCurrentIndex(i);
}


void Login::on_btn_transactions_clicked()
{
    static int i=3;
    ui->stackedWidget->setCurrentIndex(i);
}





void Login::on_btn_back_clicked()
{
    static int i=2;
    ui->stackedWidget->setCurrentIndex(i);

}


void Login::on_btn_withdrawal_clicked()
{
    static int i=4;
    ui->stackedWidget->setCurrentIndex(i);
}


void Login::on_btn_cancel_clicked()
{
    static int i=0;
    ui->stackedWidget->setCurrentIndex(i);
}


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

