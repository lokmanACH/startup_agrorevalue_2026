const express = require("express");
const router = express.Router();

const { readData } = require("../utils/db");
const { getOrderedBids } = require("../websocket/order_bids");

// GET /api/bids/:productId
router.get("/:productId", async (req, res) => {

    try {
        console.log(req.params.productId)
        const productId = Number(req.params.productId);

        if (Number.isNaN(productId)) {
            return res.status(400).json({
                error: "Invalid product id"
            });
        }

        const db = await readData();

        const bids = db["bids"] || [];
        const users = db["users"] || [];
        const products = db["products"] || [];
        const allocations = db["allocations"] || [];

        const result = getOrderedBids(productId, users, bids);
        const product = products.find((p) => p.id === productId);
        const productAllocations = allocations.filter(
            (a) => a.product_id === productId
        );

        return res.json({
            type: "bids_update",
            product_id: productId,
            bids: result,
            status: product?.status || null,
            allocations: productAllocations.length > 0 ? productAllocations : null
        });
    } catch (err) {
        console.error("GET /api/bids/:productId error:", err.message);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

module.exports = router;