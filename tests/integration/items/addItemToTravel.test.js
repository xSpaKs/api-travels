const request = require("supertest");
const { app, db } = require("../../../index");
const crypto = require("crypto");
require("dotenv").config();

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

describe("POST /travels/:id/items", () => {
    let userId, otherUserId, token, otherToken, travelId;

    beforeAll((done) => {
        // Créer 2 utilisateurs test
        db.query(
            "INSERT INTO user (email, password) VALUES (?, ?)",
            ["addItemToTravelTestUser@test.com", hashPassword("password")],
            (err, result) => {
                if (err) return done(err);
                userId = result.insertId;

                db.query(
                    "INSERT INTO user (email, password) VALUES (?, ?)",
                    [
                        "addItemToTravelOtherTestUser@test.com",
                        hashPassword("password"),
                    ],
                    (err, result) => {
                        if (err) return done(err);
                        otherUserId = result.insertId;

                        // Créer un voyage test
                        db.query(
                            "INSERT INTO travel (destination, start_date, end_date, user_id) VALUES (?, ?, ?, ?)",
                            ["Test Travel", "2023-06-04", "2024-06-04", userId],
                            (err, result) => {
                                if (err) return done(err);
                                travelId = result.insertId;

                                // Récuperer le token 1
                                request(app)
                                    .post("/login")
                                    .send({
                                        email: "addItemToTravelTestUser@test.com",
                                        password: "password",
                                    })
                                    .expect(200)
                                    .end((err, res) => {
                                        if (err) return done(err);
                                        token = res.body.token;

                                        // Récuperer le token 2
                                        request(app)
                                            .post("/login")
                                            .send({
                                                email: "addItemToTravelOtherTestUser@test.com",
                                                password: "password",
                                            })
                                            .expect(200)
                                            .end((err, res) => {
                                                if (err) return done(err);
                                                otherToken = res.body.token;
                                                done();
                                            });
                                    });
                            }
                        );
                    }
                );
            }
        );
    });

    it("Renvoie 401 si l'utilisateur n'est pas authentifié", (done) => {
        request(app)
            .get(`/travels/${travelId}/items`)
            .expect(401)
            .expect((res) => {
                expect(res.body.message).toBe(
                    "Unauthorized - No token provided"
                );
            })
            .end(done);
    });

    it("Renvoie 403 si l'utilisateur utilise un token invalide", (done) => {
        request(app)
            .get(`/travels/${travelId}/items`)
            .set("Authorization", `Bearer ${otherToken}`)
            .expect(403)
            .expect((res) => {
                expect(res.body.message).toBe(
                    "Forbidden access to this resource"
                );
            })
            .end(done);
    });

    it("Renvoie 404 si le voyage n'existe pas", (done) => {
        request(app)
            .get(`/travels/999999/items`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe("Travel not found");
            })
            .end(done);
    });

    it("Renvoie 400 s'il n'y a pas de données", (done) => {
        request(app)
            .post(`/travels/${travelId}/items`)
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toBe("Missing required information");
            })
            .end(done);
    });

    it("Renvoie 422 si les données existent mais sont invalides", (done) => {
        request(app)
            .post(`/travels/${travelId}/items`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Item",
                quantity: "quoi",
                isTaken: "allo",
            })
            .expect(422)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
            })
            .end(done);
    });

    it("Renvoie 201 et créé un item si le voyage existe", (done) => {
        request(app)
            .post(`/travels/${travelId}/items`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Item",
                quantity: 120,
                isTaken: true,
            })
            .expect(201)
            .end(done);
    });

    afterAll((done) => {
        db.query(
            "DELETE FROM user WHERE id = ? OR id = ?",
            [userId, otherUserId],
            (err) => {
                if (err) return done(err);
                db.end(done);
            }
        );
    });
});
