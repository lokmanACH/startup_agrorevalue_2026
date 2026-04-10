const express = require("express");
const jwt = require("jsonwebtoken");

const { readData } = require("../utils/db");

const router = express.Router();

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 SIGN IN
router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. read DB
        const db = await readData();
        const users = db.users;

        // 2. find user
        const user = users.find(
            u => u.email == email && u.password_hash == password
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 3. create JWT token
        const token = jwt.sign(
            {
                user
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 4. response
        res.json({
            success: true,
            token,
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;
