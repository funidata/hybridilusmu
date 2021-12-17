# Testaaminen

## Yksikkötestaus

Yksikkötestit on kirjoitettu Mocha-testikehyksellä. Testit voi ajaa komennolla

`npm run test`

## End-to-end testaus

End-to-end testit on kirjoitettu Robot Frameworkia ja Selenium-kirjastoa käyttäen. Testien ajaminen lokaalisti vaatii pythonin ja pip:n asentamista. Myös seuraavat kirjastot tulee asentaa:

`pip install robotframework`

`pip install robotframework-selenium2library`

Sekä requirements.txt-tiedostossa määritellyt python-kirjastot: 

`pip install -r requirements.txt`

Testien ajamista varten tulee käynnistää testausta varten perustettu botti. CI-workflowssa botin ympäristömuuttujat on määritelty GitHub salaisuuksina E2E Testing ympäristössä. Nykyiset testit on tehty testaamaan test-hybridilusmu-nimistä bottia. Ohjeet uuden botin käyttöönottoon ja käynnistämiseen löydät [täältä](https://github.com/hytuslain/hytuslain/blob/master/docs/kayttoonottoohjeet.md).

Testaamista varten työtilassa tulee olla määriteltynä myös vähintään kaksi testikäyttäjää, toinen vieras-roolilla ja toinen käyttäjä-roolilla. Myös testikäyttäjien sähköpostiosoitteet ja salasanat on määritelty E2E Testing ympäristössä CI-workflowta varten.

Kun testibotti on käynnissä, testit voi ajaa /test/e2e-hakemistossa komennolla:

`robot --outputdir results -v USER_PASSWORD:tähän_salasana -v GUEST_PASSWORD:tähän_salasana -v COMMAND_PREFIX:testi testcases`

Ylläoleva komento ajaa testcase-hakemistossa olevat test suitet ja luo niistä raportin results-hakemistoon. 

Github Actions workflowssa end-to-end-testit ajetaan [Docker-kontissa](https://github.com/ppodgorsek/docker-robot-framework).
