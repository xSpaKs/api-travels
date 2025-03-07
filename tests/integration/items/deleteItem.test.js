const request = require("supertest");
const { app, db } = require("../../../index");
const crypto = require("crypto");

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

describe("DELETE /items/:id (deleteItem)", () => {
    let userId, otherUserId, token, otherToken, itemId;
    beforeAll((done) => {
        // Créer 2 utilisateurs test
        db.query(
            "INSERT INTO user (email, password) VALUES (?, ?)",
            ["deleteItemTestUser@test.com", hashPassword("password")],
            (err, result) => {
                if (err) return done(err);
                userId = result.insertId;

                db.query(
                    "INSERT INTO user (email, password) VALUES (?, ?)",
                    [
                        "deleteItemOtherTestUser@test.com",
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
                                const travelId = result.insertId;

                                // Créer un item test
                                db.query(
                                    "INSERT INTO item (name, quantity, isTaken, travel_id, user_id) VALUES (?, ?, ?, ?, ?)",
                                    ["Test Item", 5, false, travelId, userId],
                                    (err, result) => {
                                        if (err) return done(err);
                                        itemId = result.insertId;

                                        // Récuperer le token 1
                                        request(app)
                                            .post("/login")
                                            .send({
                                                email: "deleteItemTestUser@test.com",
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
                                                        email: "deleteItemOtherTestUser@test.com",
                                                        password: "password",
                                                    })
                                                    .expect(200)
                                                    .end((err, res) => {
                                                        if (err)
                                                            return done(err);
                                                        otherToken =
                                                            res.body.token;
                                                        done();
                                                    });
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

    it("Renvoie 400 si l'item n'existe pas", (done) => {
        request(app)
            .delete(`/items/99999`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe("Item not found");
            })
            .end(done);
    });

    it("Renvoie 403 si l'utilisateur n'est pas autorisé", (done) => {
        request(app)
            .delete(`/items/${itemId}`)
            .set("Authorization", `Bearer ${otherToken}`)
            .expect(403)
            .expect((res) => {
                expect(res.body.message).toBe(
                    "Forbidden access to this resource"
                );
            })
            .end(done);
    });

    it("Renvoie 200 si l'item est correctement supprimé", (done) => {
        request(app)
            .delete(`/items/${itemId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe("Item deleted");
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
