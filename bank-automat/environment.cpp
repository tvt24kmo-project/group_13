#include "environment.h"

Environment::Environment() {}

QString Environment::base_url()
{
    return "http://localhost:3307";                 // tämä on staattinen koska voidaan kutsua metodia ilman että
                                                    //luodaan oliota environment-luokasta.
    //return "http://azure.kkkkkk";//esimerkki
}
