const request = require("supertest");
const { app, db } = require("../../../index");

describe("Route GET /user/:id", () => {
    let userId;

    beforeAll((done) => {
        db.query(
            "INSERT INTO user (email, password) VALUES (?, ?)",
            ["user@test.com", "hashedpassword"],
            (err, result) => {
                if (err) return done(err);
                userId = result.insertId;
                done();
            }
        );
    });

    test("Renvoie 400 si l'ID est manquant", (done) => {
        request(app).get("/users/").expect(404).end(done);
    });

    test("Renvoie 422 si l'ID n'est pas un entier", (done) => {
        request(app)
            .get("/users/abc")
            .expect(422)
            .expect((res) => {
                expect(res.body.message).toBe("User ID must be an integer");
            })
            .end(done);
    });

    test("Renvoie 404 si l'utilisateur n'existe pas", (done) => {
        request(app)
            .get("/users/99999")
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe("User not found");
            })
            .end(done);
    });

    test("Renvoie 200 et l'utilisateur si l'ID est valide", (done) => {
        request(app)
            .get(`/users/${userId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toBeDefined();
                expect(res.body.user.length).toBeGreaterThan(0);
                expect(res.body.user[0].email).toBe("user@test.com");
            })
            .end(done);
    });

    afterAll((done) => {
        db.query("DELETE FROM user WHERE email = 'user@test.com';", (err) => {
            if (err) return done(err);
            db.end((err) => done(err));
        });
    });
});
