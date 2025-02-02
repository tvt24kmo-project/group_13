#include "pin_entry.h"
#include "ui_pin_entry.h"

Pin_entry::Pin_entry(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Pin_entry)
{
    ui->setupUi(this);
    ui->lne_pin->setEchoMode(QLineEdit::Password);
    connect(ui->btn_enter,&QPushButton::clicked,this,&Pin_entry::validatePin);
}

Pin_entry::~Pin_entry()
{
    delete ui;
}
void Pin_entry::validatePin(){
    // tähän täytyy lisätä toiminto , joka tarkistaa Pin-koodin rest api kautta
    // tai jollain muulla tavalla . minulla on valmis ratkaisu , voin lisätä sen my
    //öhemmin
}

void Pin_entry::on_btn_enter_clicked()
{

}

