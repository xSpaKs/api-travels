const { z } = require("zod");

const getTravel = (db, req, res) => {
    const { id } = req.params;

    // Validations
    if (!id) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const idSchema = z.object({
        id: z.number().int(),
    });

    try {
        idSchema.parse({
            id: parseInt(id, 10),
        });
    } catch (err) {
        return res
            .status(422)
            .json({ message: "Travel ID must be an integer" });
    }

    // DB Query
    const query = "SELECT * FROM travel WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (results.length > 0) {
            if (results[0].user_id != req.user.id) {
                return res
                    .status(403)
                    .json({ message: "Forbidden access to this resource" });
            } else {
                return res.status(200).json({ travel: results[0] });
            }
        } else {
            return res.status(404).json({ message: "Travel not found" });
        }
    });
};

const getTravels = (db, req, res) => {
    const query = "SELECT * FROM travel where user_id = ?";
    db.query(query, [req.user.id], (err, results) => {
        if (!err) {
            return res.status(200).json({ travels: results });
        }
    });
};

const createTravel = (db, req, res) => {
    const { destination, start_date, end_date } = req.body;

    // Validations
    if (!destination || !start_date || !end_date) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const travelSchema = z
        .object({
            destination: z.string().min(1, "Destination is required"),
            start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "Start date has invalid format (must be YYYY-MM-DD)",
            }),
            end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "End date has invalid format (must be YYYY-MM-DD)",
            }),
        })
        .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
            message: "Start date must be before end date",
        });

    try {
        travelSchema.parse({
            destination: destination,
            start_date: start_date,
            end_date: end_date,
        });
    } catch (err) {
        return res.status(422).json({ message: err.errors });
    }

    // DB Query
    const query =
        "INSERT INTO travel (destination, start_date, end_date, user_id) VALUES (?, ?, ?, ?)";

    try {
        db.query(
            query,
            [destination, start_date, end_date, req.user.id],
            (err) => {
                if (!err) {
                    return res.status(201).json({ message: "Travel created" });
                }
            }
        );
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

module.exports = { getTravel, getTravels, createTravel };
