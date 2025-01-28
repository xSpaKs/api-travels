import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

const register = (db, req, res) => {
    const { email, password } = req.body;

    // Validations
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const userSchema = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    try {
        userSchema.parse({ email: email, password: password });
    } catch (err) {
        return res.status(422).json({ message: err.errors[0].message });
    }

    // Hash
    const hashedPassword = hashPassword(password);

    // DB Query
    let query = "SELECT * FROM user WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (!err) {
            if (results.length == 0) {
                let query = "INSERT INTO user (email, password) VALUES (?, ?)";
                db.query(query, [email, hashedPassword], (err) => {
                    if (!err) {
                        return res
                            .status(201)
                            .json({ message: "User created" });
                    }
                });
            } else {
                return res
                    .status(409)
                    .json({ message: "Email already in use" });
            }
        }
    });
};

const login = (db, req, res) => {
    const { email, password } = req.body;

    // Validations
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const userSchema = z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    try {
        userSchema.parse({ email: email, password: password });
    } catch (err) {
        return res.status(422).json({ message: err.errors[0].message });
    }

    // Hash
    const hashedPassword = hashPassword(password);

    // DB Query
    let query = "SELECT * FROM user WHERE email = ? AND password = ?";
    db.query(query, [email, hashedPassword], (err, results) => {
        if (!err) {
            if (results.length > 0) {
                const user = results[0];
                const token = jwt.sign(user, process.env.JWT_KEY, {
                    expiresIn: "1h",
                });

                return res
                    .status(200)
                    .json({ message: "User logged in", token: token });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        }
    });
};

export { register, login };
