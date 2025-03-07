const jwt = require("jsonwebtoken");
const verifyJWT = require("../../middlewares/verifyJwt");

describe("Middleware verifyJWT", () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test("Renvoie 401 si aucun token n'est fourni", () => {
        verifyJWT(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized - No token provided",
        });
        expect(next).not.toHaveBeenCalled();
    });

    test("Renvoie 401 si le token est invalide", () => {
        req.headers["authorization"] = "Bearer invalidToken";
        jest.spyOn(jwt, "verify").mockImplementation((token, key, callback) => {
            callback(new Error(), null);
        });

        verifyJWT(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Unauthorized - Invalid token",
        });
        expect(next).not.toHaveBeenCalled();
    });

    test("Passe au middleware suivant si le token est valide", () => {
        const user = { id: 1 };
        req.headers["authorization"] = "Bearer validToken";
        jest.spyOn(jwt, "verify").mockImplementation((token, key, callback) => {
            callback(null, user);
        });

        verifyJWT(req, res, next);
        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
    });
});
