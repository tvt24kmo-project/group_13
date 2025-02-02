#ifndef CHECK_CARD_TYPE_H
#define CHECK_CARD_TYPE_H
#include "card_select.h"
#include "pin_entry.h"


#include <QDialog>

namespace Ui {
class Check_card_type;
}

class Check_card_type : public QDialog
{
    Q_OBJECT

public:
    explicit Check_card_type(QWidget *parent = nullptr);
    ~Check_card_type();

private slots:
    void on_btn_double_clicked();

    void on_btn_debit_clicked();

    void on_btn_credit_clicked();



private:
    Ui::Check_card_type *ui;
    Card_select *card_select;
    Pin_entry *pin_entry;

};

#endif // CHECK_CARD_TYPE_H
