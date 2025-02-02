#ifndef CARD_SELECT_H
#define CARD_SELECT_H

#include <QDialog>
#include "pin_entry.h"

namespace Ui {
class Card_select;
}

class Card_select : public QDialog
{
    Q_OBJECT

public:
    explicit Card_select(QWidget *parent = nullptr);
    ~Card_select();

private slots:
    void on_btn_debit_info_clicked();

    void on_btn_credit_info_clicked();

private:
    Ui::Card_select *ui;
    Pin_entry *pin_entry;
};

#endif // CARD_SELECT_H
