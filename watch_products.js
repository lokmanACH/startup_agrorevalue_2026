const cron = require("node-cron");
const { readData, writeData } = require("./utils/db");
const { getOrderedBids, createAllocations } = require("./websocket/order_bids");

// Lazy-load broadcast to avoid circular-require at startup
function getBroadcast() {
    try {
        return require("./router/socket").broadcastBidsUpdate;
    } catch {
        return null;
    }
}

// find expired active products
function getExpiredProducts(products) {
    const now = new Date();
    return products.filter(p =>
        p.status === "active" &&
        new Date(p.end_time) <= now
    );
}

// main logic
async function processAuctions() {
    console.log("Auction scheduler running...");

    const db = await readData();
    const expiredProducts = getExpiredProducts(db.products);

    if (expiredProducts.length === 0) {
        console.log("No expired products");
        return;
    }

    const broadcastBidsUpdate = getBroadcast();
    const affectedProductIds  = [];

    for (const product of expiredProducts) {
        console.log(` Processing product ${product.id}`);

        const allocations = createAllocations(
            product,
            db.users,
            db.bids,
            getOrderedBids
        );

        let order = 1;

        const formatted = allocations.map(a => ({
            id: db.allocations.length + order,
            product_id: product.id,
            buyer_id: a.buyer_id,
            bid_id: a.bid_id,
            allocated_quantity: a.allocated_quantity,
            final_price: a.final_price,
            order: order++,
            created_at: new Date().toISOString()
        }));

        db.allocations.push(...formatted);
        product.status = "closed";
        affectedProductIds.push(product.id);
    }

    await writeData(db);
    console.log("Auctions completed & saved");

    // Notify connected WebSocket clients for each closed product
    if (broadcastBidsUpdate) {
        for (const pid of affectedProductIds) {
            await broadcastBidsUpdate(pid);
        }
    }
}

// scheduler
function startAuctionScheduler() {
    // Run every minute (change to "0 */12 * * *" for production)
    cron.schedule("* * * * *", async () => {
        await processAuctions();
    });

    console.log("Auction scheduler started");
}

module.exports = { startAuctionScheduler };

