const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

const verifyJWT = require("./middlewares/verifyJwt.js");

const getUserByID = require("./routes/routes.user.js");
const { register, login } = require("./routes/routes.auth.js");
const {
    getTravel,
    createTravel,
    getTravels,
} = require("./routes/routes.travel.js");
const {
    modifyItem,
    deleteItem,
    getItemsFromTravel,
    addItemToTravel,
} = require("./routes/routes.item.js");

const app = express();
const port = 3001;
dotenv.config();

app.use(express.json());

// Connexion à la base de données MySQL via le package mysql2
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données:", err);
        return;
    }
});

// Route pour récupérer les informations d'un utilsateur
app.get("/users/:id", (req, res) => {
    getUserByID(db, req, res);
});

// Route pour créer un compte
app.post("/register", (req, res) => {
    register(db, req, res);
});

// Route pour se connecter
app.post("/login", (req, res) => {
    login(db, req, res);
});

// Route pour récupérer tous les voyages
app.get("/travels", verifyJWT, (req, res) => {
    getTravels(db, req, res);
});

// Route pour créer un voyage
app.post("/travels", verifyJWT, (req, res) => {
    createTravel(db, req, res);
});

// Route pour récupérer un voyage
app.get("/travels/:id", verifyJWT, (req, res) => {
    getTravel(db, req, res);
});

// Route pour modifier un item
app.put("/items/:id", verifyJWT, (req, res) => {
    modifyItem(db, req, res);
});

// Route pour supprimer un item
app.delete("/items/:id", verifyJWT, (req, res) => {
    deleteItem(db, req, res);
});

// Route pour récupérer les items d'un voyage
app.get("/travels/:id/items", verifyJWT, (req, res) => {
    getItemsFromTravel(db, req, res);
});

// Route pour ajouter un item à un voyage
app.post("/travels/:id/items", verifyJWT, (req, res) => {
    addItemToTravel(db, req, res);
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

module.exports = { app, db };
