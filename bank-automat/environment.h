#ifndef ENVIRONMENT_H
#define ENVIRONMENT_H

#include <QtCore/QString>  // Korjataan polku QtCore-moduulin kautta

class Environment
{
public:
    Environment();
    static QString base_url();
};

#endif // ENVIRONMENT_H
