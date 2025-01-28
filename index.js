import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";

import getUserByID from "./routes/routes.user.js";
import { register, login } from "./routes/routes.auth.js";
import verifyJWT from "./middlewares/verifyJwt.js";
import { getTravel, createTravel, getTravels } from "./routes/routes.travel.js";
import {
    modifyItem,
    deleteItem,
    getItemsFromTravel,
    addItemToTravel,
} from "./routes/routes.item.js";

const app = express();
const port = 3000;
dotenv.config();

app.use(express.json());

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
    console.log("Connexion à la base de données réussie");
});

app.get("/users/:id", (req, res) => {
    console.log("GET request on /users/:id");
    getUserByID(db, req, res);
});

app.post("/register", (req, res) => {
    console.log("POST request on /register");
    register(db, req, res);
});

app.post("/login", (req, res) => {
    console.log("POST request on /login");
    login(db, req, res);
});

app.get("/travels", verifyJWT, (req, res) => {
    console.log("GET request on /travels");
    getTravels(db, req, res);
});

app.post("/travels", verifyJWT, (req, res) => {
    console.log("POST request on /travels");
    createTravel(db, req, res);
});

app.get("/travels/:id", verifyJWT, (req, res) => {
    console.log("GET request on /travels/:id");
    getTravel(db, req, res);
});

app.put("/items/:id", verifyJWT, (req, res) => {
    console.log("PUT request on /items/:id");
    modifyItem(db, req, res);
});

app.delete("/items/:id", verifyJWT, (req, res) => {
    console.log("DELETE request on /items/:id");
    deleteItem(db, req, res);
});

app.get("/travels/:id/items", verifyJWT, (req, res) => {
    console.log("GET request on /travels/:id/items");
    getItemsFromTravel(db, req, res);
});

app.post("/travels/:id/items", verifyJWT, (req, res) => {
    console.log("POST request on /travels/:id/items");
    addItemToTravel(db, req, res);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
