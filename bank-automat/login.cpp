#include "environment.h"
#include "login.h"
#include "ui_login.h"

Login::Login(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Login)
{
    ui->setupUi(this);
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

              }
              else {
                  ui->labelInfo->setText("Väärä tunnus/salasana");
              }

          }
      }
    reply->deleteLater();
    loginManager->deleteLater();
}
