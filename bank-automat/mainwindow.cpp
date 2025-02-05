#include "mainwindow.h"
#include "login.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);



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

