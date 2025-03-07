const { z } = require("zod");
const fetch = require("node-fetch");

const modifyItem = (db, req, res) => {
    const { id } = req.params;
    const { name, quantity, isTaken } = req.body;

    // Validations
    if (!id || !name || !quantity || isTaken == null) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const modifyItemSchema = z.object({
        id: z.number().int(),
        name: z.string(),
        quantity: z.number().int(),
        isTaken: z.boolean(),
    });

    try {
        modifyItemSchema.parse({
            id: parseInt(id, 10),
            name: name,
            quantity: parseInt(quantity, 10),
            isTaken: isTaken,
        });
    } catch (err) {
        return res.status(422).json({ errors: err.errors });
    }

    // DB Queries
    const selectQuery = "SELECT * FROM item WHERE id = ?";
    db.query(selectQuery, [id], (err, results) => {
        if (results.length == 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (results[0].user_id != req.user.id) {
            return res
                .status(403)
                .json({ message: "Forbidden access to this resource" });
        }

        const updateQuery =
            "UPDATE item SET name = ?, quantity = ?, isTaken = ? WHERE id = ?";
        db.query(updateQuery, [name, quantity, isTaken, id], (err, results) => {
            return res.status(200).json({ message: "Item updated" });
        });
    });
};

const deleteItem = (db, req, res) => {
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
        return res.status(422).json({ message: "Item ID must be an integer" });
    }

    const selectQuery = "SELECT user_id from item where id = ?";
    db.query(selectQuery, [id], (err, results) => {
        if (results.length == 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (results[0].user_id != req.user.id) {
            return res
                .status(403)
                .json({ message: "Forbidden access to this resource" });
        }

        const deleteQuery = "DELETE FROM item WHERE id = ?";
        db.query(deleteQuery, [id], (err, results) => {
            return res.status(200).json({ message: "Item deleted" });
        });
    });
};

const getItemsFromTravel = async (db, req, res) => {
    const response = await fetch(
        process.env.API_URL + "travels/" + req.params.id,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    req.headers["authorization"]?.split(" ")[1]
                }`,
            },
        }
    );

    const json = await response.json();

    if (!response.ok)
        return res.status(response.status).json({ message: json.message });

    const query = "SELECT * FROM item where travel_id = ?";
    db.query(query, [json.travel.id], (err, results) => {
        return res.status(200).json({ items: results });
    });
};

const addItemToTravel = async (db, req, res) => {
    const { name, quantity, isTaken } = req.body;

    // Validations
    if (!name || !quantity || isTaken == null) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    const itemSchema = z.object({
        name: z.string(),
        quantity: z.number().int(),
        isTaken: z.boolean(),
    });

    try {
        itemSchema.parse({
            name: name,
            quantity: parseInt(quantity, 10),
            isTaken: isTaken,
        });
    } catch (err) {
        return res.status(422).json({ message: err.errors });
    }

    // Retrieve travel information
    const response = await fetch(
        process.env.API_URL + "travels/" + req.params.id,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    req.headers["authorization"]?.split(" ")[1]
                }`,
            },
        }
    );

    const json = await response.json();
    if (!response.ok)
        return res.status(response.status).json({ message: json.message });

    // DB Query
    const query =
        "INSERT INTO item (travel_id, name, quantity, isTaken, user_id) VALUES (?, ?, ?, ?, ?)";
    db.query(
        query,
        [json.travel.id, name, quantity, isTaken, req.user.id],
        (err) => {
            return res.status(201).json({ message: "Item created" });
        }
    );
};

module.exports = {
    modifyItem,
    deleteItem,
    getItemsFromTravel,
    addItemToTravel,
};
