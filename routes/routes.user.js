const getUserByID = (db, req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res
            .status(400)
            .json({ message: "Missing required information" });
    }

    if (isNaN(userId) || parseInt(userId) != userId) {
        return res.status(422).json({ message: "User ID must be an integer" });
    }

    const query = "SELECT * FROM user WHERE id = ?";
    db.query(query, [userId], (err, results) => {
        if (!err) {
            if (results.length == 0) {
                return res.status(404).json({ message: "User not found" });
            } else {
                return res.status(200).json({ user: results });
            }
        }
    });
};

export default getUserByID;
