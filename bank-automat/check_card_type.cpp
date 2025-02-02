#include "check_card_type.h"
#include "ui_check_card_type.h"

Check_card_type::Check_card_type(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::Check_card_type)
{
    ui->setupUi(this);
    pin_entry=new Pin_entry(this);
}

Check_card_type::~Check_card_type()
{
    delete ui;
}

void Check_card_type::on_btn_double_clicked()
{
    card_select=new Card_select(this);
    card_select->open();
    hide();
}


void Check_card_type::on_btn_debit_clicked()
{
    pin_entry->open();
    hide();

}


void Check_card_type::on_btn_credit_clicked()
{
    pin_entry->open();
    hide();
}







