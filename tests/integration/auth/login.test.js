const request = require("supertest");
const { app, db } = require("../../../index");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

describe("Route /login", () => {
    beforeAll((done) => {
        db.query(
            "INSERT INTO user (email, password) VALUES (?, ?)",
            ["login@test.com", hashPassword("password")],
            (err) => done(err)
        );
    });

    test("Renvoie 400 si email ou password est manquant", (done) => {
        request(app)
            .post("/login")
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toBe("Missing required information");
            })
            .end(done);
    });

    test("Renvoie 422 si l'email ou le password est invalide", (done) => {
        request(app)
            .post("/login")
            .send({ email: "invalid-email", password: "123" })
            .expect(422)
            .expect((res) => {
                expect(res.body.message.length).toBeGreaterThan(0);
            })
            .end(done);
    });

    test("Renvoie 404 si l'utilisateur n'existe pas", (done) => {
        request(app)
            .post("/login")
            .send({ email: "fake.login@test.com", password: "password" })
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe("User not found");
            })
            .end(done);
    });

    test("Renvoie 200 et un token si l'utilisateur se connecte avec succès", (done) => {
        request(app)
            .post("/login")
            .send({
                email: "login@test.com",
                password: "password",
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe("User logged in");
                expect(res.body.token).toBeDefined();
                expect(() =>
                    jwt.verify(res.body.token, process.env.JWT_KEY)
                ).not.toThrow();
            })
            .end(done);
    });

    afterAll((done) => {
        db.query("DELETE FROM user WHERE email = 'login@test.com';", (err) => {
            if (err) return done(err);
            db.end((err) => done(err));
        });
    });
});
