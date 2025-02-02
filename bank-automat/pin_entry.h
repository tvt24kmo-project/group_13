#ifndef PIN_ENTRY_H
#define PIN_ENTRY_H

#include <QDialog>

namespace Ui {
class Pin_entry;
}

class Pin_entry : public QDialog
{
    Q_OBJECT

public:
    explicit Pin_entry(QWidget *parent = nullptr);
    ~Pin_entry();

public slots:
    void validatePin();
private slots:
    void on_btn_enter_clicked();

private:
    Ui::Pin_entry *ui;
};

#endif // PIN_ENTRY_H
