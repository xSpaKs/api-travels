const request = require("supertest");
const { app, db } = require("../../../index");

describe("Route /register", () => {
    beforeAll((done) => {
        db.query(
            "DELETE FROM user WHERE email = 'register@test.com'",
            (err) => {
                if (err) return done(err);
                done();
            }
        );
    });

    test("Renvoie 400 si email ou password est manquant", (done) => {
        request(app)
            .post("/register")
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.message).toBe("Missing required information");
            })
            .end(done);
    });

    test("Renvoie 409 si l'email est déjà utilisé", (done) => {
        db.query(
            "INSERT INTO user (email, password) VALUES ('register@test.com', 'password')",
            (err) => {
                if (err) return done(err);

                request(app)
                    .post("/register")
                    .send({
                        email: "register@test.com",
                        password: "password",
                    })
                    .expect(409)
                    .expect((res) => {
                        expect(res.body.message).toBe("Email already in use");
                    })
                    .end((err) => {
                        if (err) return done(err);
                        db.query(
                            "DELETE FROM user WHERE email = 'register@test.com';",
                            () => done()
                        );
                    });
            }
        );
    });

    test("Renvoie 201 si l'utilisateur est créé", (done) => {
        db.query(
            "DELETE FROM user WHERE email = 'register@test.com';",
            (err) => {
                if (err) return done(err);

                request(app)
                    .post("/register")
                    .send({
                        email: "register@test.com",
                        password: "password",
                    })
                    .expect(201)
                    .expect((res) => {
                        expect(res.body.message).toBe("User created");
                    })
                    .end(done);
            }
        );
    });

    afterAll((done) => {
        db.query(
            "DELETE FROM user WHERE email = 'register@test.com';",
            (err) => {
                if (err) return done(err);
                db.end((err) => done(err));
            }
        );
    });
});
