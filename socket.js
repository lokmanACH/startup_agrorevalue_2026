const WebSocket = require("ws");
const { readData } = require("./utils/db");
const { getOrderedBids } = require("./websocket/order_bids");

// WebSocket server on port 8000
let wss;

try {
    wss = new WebSocket.Server({ port: 8000 });
    console.log("✅ WebSocket server running on ws://localhost:8000");
} catch (err) {
    console.error("❌ Failed to start WebSocket server:", err.message);
}

if (!wss) {
    // Fallback: create a dummy wss object to prevent crashes
    wss = { on: () => {}, broadcast: () => {} };
}

// Track subscriptions: productId → Set of ws clients
const productSubscriptions = new Map();

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Track which products THIS connection is subscribed to
    const mySubscriptions = new Set();

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            // Client sends: { type: "subscribe", id_product: <number> }
            if (data.type === "subscribe" && data.id_product != null) {
                const productId = Number(data.id_product);
                
                mySubscriptions.add(productId);

                if (!productSubscriptions.has(productId)) {
                    productSubscriptions.set(productId, new Set());
                }
                productSubscriptions.get(productId).add(ws);

                // Immediately push current state
                await pushBidsToClient(ws, productId);
            }

            // Client sends: { type: "unsubscribe", id_product: <number> }
            if (data.type === "unsubscribe" && data.id_product != null) {
                const productId = Number(data.id_product);
                mySubscriptions.delete(productId);
                
                if (productSubscriptions.has(productId)) {
                    productSubscriptions.get(productId).delete(ws);
                }
            }

        } catch (err) {
            console.error("WS message error:", err.message);
            // Don't crash, just notify client if possible
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ error: "Invalid message format" }));
            }
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        // Remove this client from all product subscription sets it was in
        mySubscriptions.forEach(productId => {
            if (productSubscriptions.has(productId)) {
                productSubscriptions.get(productId).delete(ws);
                // Optional: remove entry from map if set is empty
                if (productSubscriptions.get(productId).size === 0) {
                    productSubscriptions.delete(productId);
                }
            }
        });
        mySubscriptions.clear();
    });

    // Handle errors to prevent crash
    ws.on("error", (err) => {
        console.error("WS client error:", err.message);
    });

    ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected" }));
});

/**
 * Push the latest ordered bids for a product to a single client.
 */
async function pushBidsToClient(ws, productId) {
    try {
        if (ws.readyState !== WebSocket.OPEN) return;

        const db = await readData();
        const bids = db["bids"] || [];
        const users = db["users"] || [];
        const products = db["products"] || [];
        const allocations = db["allocations"] || [];
        
        const result = getOrderedBids(productId, users, bids);
        const product = products.find(p => p.id === productId);
        const productAllocations = allocations.filter(a => a.product_id === productId);

        ws.send(JSON.stringify({ 
            type: "bids_update", 
            product_id: productId, 
            bids: result,
            status: product?.status,
            allocations: productAllocations.length > 0 ? productAllocations : null
        }));
    } catch (err) {
        console.error("pushBidsToClient error:", err.message);
    }
}

/**
 * Broadcast updated bids to ALL clients subscribed to a given product.
 */
async function broadcastBidsUpdate(productId) {
    if (!productSubscriptions.has(productId)) return;
    const clients = productSubscriptions.get(productId);
    for (const ws of clients) {
        await pushBidsToClient(ws, productId);
    }
}

module.exports = { wss, broadcastBidsUpdate };
