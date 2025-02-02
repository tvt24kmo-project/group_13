QT       += core gui
QT +=network
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++17

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    card_select.cpp \
    check_card_type.cpp \
    environment.cpp \
    login.cpp \
    main.cpp \
    mainwindow.cpp \
    pin_entry.cpp

HEADERS += \
    card_select.h \
    check_card_type.h \
    environment.h \
    login.h \
    mainwindow.h \
    pin_entry.h

FORMS += \
    card_select.ui \
    check_card_type.ui \
    login.ui \
    mainwindow.ui \
    pin_entry.ui

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target
