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
    qDebug()<<"klikkasit";
    QJsonObject jsonObj;
    jsonObj.insert("card_number",ui->text_card_number->text());
    jsonObj.insert("pin",ui->text_pin->text());

    QString site_url="http://localhost:3307/login";
    QNetworkRequest request(site_url);
    request.setHeader(QNetworkRequest::ContentTypeHeader,"application/json");
    loginManager = new QNetworkAccessManager(this);
    connect(loginManager,SIGNAL(finished(QNetworkReply*)),this,SLOT(loginSlot(QNetworkReply*)));
    reply = loginManager->post(request, QJsonDocument(jsonObj).toJson());
}

void Login::loginSlot(QNetworkReply *reply)
{
      qDebug()<<"loginslot";
    response_data=reply->readAll();
    qDebug()<<response_data;
    reply->deleteLater();
    loginManager->deleteLater();
}

