#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow> // Sisällytetään Qt:n pääikkunaluokka

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; } // Qt:n käyttöliittymänimiavaruus
QT_END_NAMESPACE

// Pääikkunaluokka, joka näyttää tervetulonäkymän
class MainWindow : public QMainWindow
{
    Q_OBJECT // Qt:n makro signaaleja ja slotteja varten

public:
    // Pääikkunan rakentaja
    // @param parent: osoitin vanhempaan widgettiin (oletuksena nullptr)
    MainWindow(QWidget *parent = nullptr);
    
    // Tuhoaja, vapauttaa resurssit
    ~MainWindow();

protected:
    // Tapahtumakäsittelijä ikkunan koon muutoksille
    // @param watched: tarkkailtava objekti
    // @param event: käsiteltävä tapahtuma
    // @return true jos tapahtuma käsiteltiin, muuten false
    bool eventFilter(QObject *watched, QEvent *event) override;

private slots:
    // Käsittelee "Start"-painikkeen painalluksen
    // Avaa kirjautumisikkunan ja sulkee tervetulonäkymän
    void on_btnstart_clicked();

private:
    Ui::MainWindow *ui; // Osoitin käyttöliittymäkomponentteihin
};

#endif // MAINWINDOW_H
