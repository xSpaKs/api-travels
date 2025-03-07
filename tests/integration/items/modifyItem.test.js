const request = require("supertest");
const { app, db } = require("../../../index");
const crypto = require("crypto");

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

describe("Route /items/:id (modifyItem)", () => {
    let userId, otherUserId, travelId, itemId, token, otherToken;

    beforeAll((done) => {
        // Créer 2 utilisateurs test
        db.query(
            "INSERT INTO user (email, password) VALUES (?, ?)",
            ["modifyItemTestUser@test.com", hashPassword("password")],
            (err, result) => {
                if (err) return done(err);
                userId = result.insertId;

                db.query(
                    "INSERT INTO user (email, password) VALUES (?, ?)",
                    [
                        "modifyItemOtherTestUser@test.com",
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

                                // Créer un item test
                                db.query(
                                    "INSERT INTO item (name, quantity, isTaken, travel_id, user_id) VALUES (?, ?, ?, ?, ?)",
                                    ["Test Item", 5, false, travelId, userId],
                                    (err, result) => {
                                        if (err) return done(err);
                                        itemId = result.insertId;

                                        // Récupérer le token 1
                                        request(app)
                                            .post("/login")
                                            .send({
                                                email: "modifyItemTestUser@test.com",
                                                password: "password",
                                            })
                                            .expect(200)
                                            .end((err, res) => {
                                                if (err) return done(err);
                                                token = res.body.token;
                                            });

                                        // Récupérer le token 2
                                        request(app)
                                            .post("/login")
                                            .send({
                                                email: "modifyItemOtherTestUser@test.com",
                                                password: "password",
                                            })
                                            .expect(200)
                                            .end((err, res) => {
                                                if (err) return done(err);
                                                otherToken = res.body.token;
                                                done();
                                            });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });

    test("Renvoie 400 si des informations sont manquantes", (done) => {
        request(app)
            .put(`/items/${itemId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toBe("Missing required information");
            })
            .end(done);
    });

    test("Renvoie 422 si les données sont invalides", (done) => {
        request(app)
            .put(`/items/${itemId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: 123, quantity: "wrong", isTaken: "notBoolean" })
            .expect(422)
            .expect((res) => {
                expect(res.body.errors).toBeDefined();
            })
            .end(done);
    });

    test("Renvoie 404 si l'item n'existe pas", (done) => {
        request(app)
            .put(`/items/9999999`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Item", quantity: 3, isTaken: true })
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe("Item not found");
            })
            .end(done);
    });

    test("Renvoie 403 si l'utilisateur n'est pas autorisé", (done) => {
        request(app)
            .put(`/items/${itemId}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ name: "Updated Item", quantity: 3, isTaken: true })
            .expect(403)
            .expect((res) => {
                expect(res.body.message).toBe(
                    "Forbidden access to this resource"
                );
            })
            .end(done);
    });
    test("Renvoie 200 si l'item est mis à jour avec succès", (done) => {
        request(app)
            .put(`/items/${itemId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Item", quantity: 3, isTaken: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe("Item updated");
            })
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
