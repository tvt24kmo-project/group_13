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

# Database

- MySQL luotuna juuressa olevalla SQL Dumpilla.
### transaction

transaction
Tyyppi |	Komento           |   	Esimerkki       | 	Body                 |          	        Selite  

post   |	Lisää tapahtuma   |	/transaction/	    |transaction_type,       |  	Luodaan tapahtumatietue transaction-tauluun
                                                    |sum, type, id_account   |   


put	   |Päivitä tapahtuman    | /transaction/1	    |transaction_type,       |  Päivitetään tietoja ID:n                              
       |                       |                    |sum,type,id_account     |      perustella

delete |Poista tapahtuma	  | /transaction/1		|                        |       Poistetaan tapahtumatietue ID:n perusteella

get	   |Hae kaikki tapahtumat |  /transaction/		|                        |   Hakee kaikki transaction-taulussa olevat tapahtumatietueet 
                        

get	   | Hae tietty tapahtuma |  /transaction/1		|                        | Hakee transaction-taulusta tapahtumatietueen ID:n perusteella


get	   | Hae tietyn tilin     |/transaction/account/1|	                      |Hakee  tietyn tilin tapahtumatietueet id_account:n perusteella
        tapahtumat

**** date tulee automasisesti , eli ei tarvi täytää body kenttä.

![ER Kaavio](er_kaavio.png)

