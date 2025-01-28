# API de gestion des voyages et des utilisateurs

Cette API permet de gérer les utilisateurs, les voyages et les objets associés aux voyages. Elle permet également d'effectuer l'inscription, la connexion, ainsi que la gestion des voyages et des objets au sein de chaque voyage.

## Fonctionnalités

-   Utilisateur : Inscription, connexion, récupération des informations d'un utilisateur par son ID.
-   Voyages : Création, récupération, modification et suppression de voyages.
-   Objets : Ajout, modification, suppression et récupération des objets associés à un voyage.

## Prérequis

-   Node.js
-   MySQL
-   dotenv pour la gestion des variables d'environnement
-   zod pour la validation des données
-   jwt pour l'authentification par token

## Installation

### Clonez ce projet sur votre machine.

-   git clone https://github.com/xSpaKs/api-travels

### Installez les dépendances nécessaires avec npm ou yarn.

-   npm install
    ou
-   yarn install

### Créez un fichier .env à la racine du projet avec les variables suivantes :

-   URL_API=http://localhost:3000
-   DB_HOST=localhost
-   DB_USER=your_database_user
-   DB_PASSWORD=your_database_password
-   DB_NAME=your_database_name

### Lancez l'application avec la commande suivante :

-   npm start
    ou
-   yarn start
    L'application sera alors disponible sur http://localhost:3000.

## Routes API

### Utilisateurs

-   GET /users/:id : Récupérer un utilisateur par son ID.
-   POST /register : Inscription d'un nouvel utilisateur.
-   POST /login : Connexion d'un utilisateur.

### Voyages

-   GET /travels : Récupérer la liste de tous les voyages (nécessite un JWT valide).
-   POST /travels : Créer un nouveau voyage (nécessite un JWT valide).
-   GET /travels/:id : Récupérer un voyage par son ID (nécessite un JWT valide).

### Objets (Items)

-   PUT /items/:id : Modifier un objet (nécessite un JWT valide).
-   DELETE /items/:id : Supprimer un objet (nécessite un JWT valide).
-   GET /travels/:id/items : Récupérer la liste des objets associés à un voyage (nécessite un JWT valide).
-   POST /travels/:id/items : Ajouter un objet à un voyage (nécessite un JWT valide).

## Middleware de vérification JWT

La plupart des routes nécessitent un token JWT pour vérifier l'authentification de l'utilisateur. Le token doit être envoyé dans les en-têtes HTTP sous la forme :

Authorization: Bearer <token>

## Développement

Si vous souhaitez contribuer à ce projet, veuillez vous assurer de respecter les bonnes pratiques de développement et d'authentification.

### Structure des fichiers

-   index.js : Fichier principal qui initialise le serveur Express, configure les routes et connecte la base de données MySQL.
-   routes/routes.user.js : Contient les fonctions pour gérer les utilisateurs (inscription, connexion, etc.).
-   routes/routes.auth.js : Contient les fonctions liées à l'authentification des utilisateurs.
-   routes/routes.travel.js : Contient les fonctions pour gérer les voyages.
-   routes/routes.item.js : Contient les fonctions pour gérer les objets des voyages.
-   middlewares/verifyJwt.js : Middleware pour vérifier les tokens JWT.
