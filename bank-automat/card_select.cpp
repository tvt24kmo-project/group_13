#include "card_select.h"
#include "ui_card_select.h"

Card_select::Card_select(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Card_select)
{
    ui->setupUi(this);
    pin_entry=new Pin_entry(this);
}

Card_select::~Card_select()
{
    delete ui;
}

void Card_select::on_btn_debit_info_clicked()
{

    pin_entry->open();
    hide();
}


void Card_select::on_btn_credit_info_clicked()
{

    pin_entry->open();
    hide();
}

