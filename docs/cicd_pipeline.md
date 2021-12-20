# Jatkuva integrointi ja käyttöönotto

## Continuous Integration - Jatkuva integrointi

Pull requestin tekeminen master-haaraan käynnistää [node.js.yml](https://github.com/hytuslain/hytuslain/blob/master/.github/workflows/node.js.yml)-workflow'n suorituksen Github Actionsissa. Mocha-yksikkötestit ajetaan PostgreSQL-testitietokannan kanssa ja uusi testikattavuus päivitetään CodeCoviin. Koodin syntaksi tarkastetaan ESlintillä [.eslintrc.js](https://github.com/hytuslain/hytuslain/blob/master/dev/.eslintrc.js)-tiedostossa määriteltyjen sääntöjen mukaan. Lopuksi ajetaan Robot Framework -end-to-end-testit, joista generoituu raportti workflow'n alle sekä kommentti testauksen tuloksista commitiin. Node.js.yml-workflow'ssa tarvittavat muuttujat on määritelty GitHub-salaisuuksina E2E Testing -ympäristössä. 

## Continuous Development - Jatkuva käyttöönotto

Käyttöönotto vaatii pull requestin kehityshaarasta master-haaraan, node.js.yml-workflow'n läpimenon sekä hyväksynnän kahdelta katselmoijalta. Kun pull request on hyväksytty mergettäväksi master-haaraan, node.js.yml-workflow ajetaan uudelleen ja hyväksytyn ajon jälkeen ajetaan [docker-image.yml](https://github.com/hytuslain/hytuslain/blob/master/.github/workflows/docker-image.yml)-workflow. Docker-image.yml-workflow'ssa tarvittavat muuttujat on määritelty Docker deployment -ympäristössä. Docker-image.yml-workflow'ssa luodaan uusi versio docker imagesta, joka viedään DockerHubiin. Staging-palvelimella haetaan DockerHubista sovelluksen uusin versio. 
