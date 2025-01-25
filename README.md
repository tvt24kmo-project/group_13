# group_13

# Frontend / Bank-Automat

# Backend RestAPI

## Käytössä olevat Node.JS moduulit:
- dotenv
- mysql2

## HOX HOX!!
Käytössä dotenv moduuli. Luokaa siis backend kansioon oma .env tiedosto ja syöttäkää siihen oman ympäristönne tiedot. Backend kansiossa on .env tiedoston malli. Lisätkää sinne muuttujia jos niitä joudutte omaan ympäristöön luomaan. Siitä on sitte kätevä muiden päivittää omaa .env tiedostoa. **MUISTAJAA POISTAA KAIKKI OMAN YMPÄRISTÖN TIEDOT!!!**

## RestAPI:t

### user

| Tyyppi | Komento                 | Esimerkki | Body Kentät                 | Selite                                                                           |
| ------ | ----------------------- | --------- | --------------------------- | -------------------------------------------------------------------------------- |
| post   | Lisää käyttäjä          | /user/    | firstname,lastname,pic_path | Luodaan käyttäjätietue user tauluun                                              |
| put    | Päivitä käyttäjän tiedot| /user/1   | firstname,lastname,pic_path | Päivitetään käyttäjätietueen tietoja                                             |
| delete | Poista käyttäjä         | /user/1   |                             | Poistetaan käyttäjätietue ID:n perusteella                                       |
| get    | Hae kaikki käyttäjät    | /user/    |                             | Hakee kaikki user taulussa olevat käyttäjätietueet ja palauttaa ne json muodossa |
| get    | Hae tiettyä käyttäjä    | /user/1   |                             | Hakee user taulusta käyttäjätietueen ID:n perusteella                            |

### account

| Tyyppi | Komento                 | Esimerkki       | Body Kentät                  | Selite                                                                          |
| ------ | ----------------------- | --------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| post   | Lisää tili              | /account/       | amount,limit,balance,id_user | Luodaan tilitietue account tauluun                                              |
| put    | Päivitä tilin tiedot    | /account/1      | amount,limit,balance,id_user | Päivitetään tilitietueen tietoja                                                |
| delete | Poista tili             | /account/1      |                              | Poistetaan tilitietue ID:n perusteella                                          |
| get    | Hae kaikki tilit        | /account/       |                              | Hakee kaikki account taulussa olevat tilitietueet ja palauttaa ne json muodossa |
| get    | Hae tiettyä tiliä       | /account/1      |                              | Hakee account taulusta tilitietueen id_account:n perusteella                    |
| get    | Hae tietyn userin tilit | /account/user/1 |                              | Hakee account taulusta tietyn userin tilitietueet id_user:n perusteella         |


### card_account

| Tyyppi | Komento                       | Esimerkki            | Body Kentät                    | Selite                                                                                      |
| ------ | -----------------------       | ---------------      | ------------------------       | -------------------------------------------------------------------------------             |
| post   | Lisää korttitili              | /card_account/       | id_card,id_account,account_type| Luodaan korttitilitietue card_account tauluun                                               |
| put    | Päivitä korttitilin tiedot    | /card_account/1      | id_card,id_account,account_type| Päivitetään korttitilitietueen tietoja                                                      |
| delete | Poista korttitili             | /card_account/1      |                                | Poistetaan korttitilitietue ID:n perusteella                                                |
| get    | Hae kaikki korttitilit        | /card_account/       |                                | Hakee kaikki card_account taulussa olevat korttitilitietueet ja palauttaa ne json muodossa  |
| get    | Hae tiettyä korttitiliä       | /card_account/1      |                                | Hakee card_account taulusta korttitilitietueen id_card_account:n perusteella                |


### card

| Tyyppi | Komento                 | Esimerkki    | Body Kentät                  | Selite                                                                          |
| ------ | ----------------------- | -------------| ---------------------------- | ------------------------------------------------------------------------------- |
| post   | Lisää kortti            | /card/       | type,card_number,pin,retrys  | Luodaan korttitietue card tauluun                                               |
| put    | Päivitä tilin tiedot    | /card/1      | type,card_number,pin,retrys  | Päivitetään korttitietueen tietoja                                              |
| delete | Poista kortti           | /card/1      |                              | Poistetaan korttitietue ID:n perusteella                                        |
| get    | Hae kaikki kortit       | /card/       |                              | Hakee kaikki card taulussa olevat korttitietueet ja palauttaa ne json muodossa  |
| get    | Hae tiettyä korttia     | /card/1      |                              | Hakee card taulusta tilitietueen id_card:n perusteella                          |


# Database

- MySQL luotuna juuressa olevalla SQL Dumpilla.

![ER Kaavio](er_kaavio.png)