# Instructions d'installation et de lancement du projet

## Packages : Comment installer 
   - npm install


## Configuration
   - ### Env
      - Créer fichier .env dans le répertoire principal
      - Y copier les données du fichier conf/.env-example
      - Modifier les valeurs si besoin selon les consignes ci-dessous.
      - Seul DB_LINK est à modifier obligatoirement, soit tout le lien, soit 'user' et 'password'
      - Ensuite vous pouvez modifier TOKEN_SIGN_KEY et EMAIL_SALT
      - Pour finir : NODE_ENV : soit 'dev', soit 'production'.


## Lancement
   - npm server / nodemon server / npx nodemon server