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
            ["createTravelTestUser@test.com", hashPassword("password")],
            (err, result) => {
                if (err) return done(err);
                userId = result.insertId;

                db.query(
                    "INSERT INTO user (email, password) VALUES (?, ?)",
                    [
                        "createTravelOtherTestUser@test.com",
                        hashPassword("password"),
                    ],
                    (err, result) => {
                        if (err) return done(err);
                        otherUserId = result.insertId;

                        // Récuperer le token 1
                        request(app)
                            .post("/login")
                            .send({
                                email: "createTravelTestUser@test.com",
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
                                        email: "createTravelOtherTestUser@test.com",
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
    });

    it("Renvoie 401 si l'utilisateur n'est pas authentifié", (done) => {
        request(app)
            .get(`/travels`)
            .expect(401)
            .expect((res) => {
                expect(res.body.message).toBe(
                    "Unauthorized - No token provided"
                );
            })
            .end(done);
    });

    it("Renvoie 400 s'il n'y a pas de données", (done) => {
        request(app)
            .post(`/travels`)
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
            .post(`/travels`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                destination: "Paris",
                start_date: "2024-2222-2",
                end_date: 7,
            })
            .expect(422)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
            })
            .end(done);
    });

    it("Renvoie 201 et créé un voyage", (done) => {
        request(app)
            .post(`/travels`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                destination: "Paris",
                start_date: "2024-06-06",
                end_date: "2025-06-06",
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
