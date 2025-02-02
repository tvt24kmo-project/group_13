#include "mainwindow.h"
#include "login.h"
#include "ui_mainwindow.h"
#include <QTimer>
#include<QLCDNumber>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    QTimer *timer =new QTimer(this);
    connect(timer,SIGNAL(timeout()),this,SLOT(showTime()));
    timer->start(1000);

    showTime();

}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_btnstart_clicked()
{
    hide();
    Login *objLogin=new Login(this);
    objLogin->open();
}
void MainWindow::showTime()
{
    QTime time =QTime ::currentTime();
    QString text = time.toString("hh:mm");
    if((time.second()%2)==0)
        text[2]=' ';
    ui-> lcdNumber->display(text);

}

