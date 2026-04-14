function getOrderedBids(productId, users, bids) {
    const bid_array = bids
        // filter by product
        .filter(b => b.product_id === productId)

        // join with user + filter active & verified
        .map(b => {
            const user = users.find(u => u.id === b.buyer_id);

            // skip if no user or not valid
            if (!user || !user.is_verified || !user.is_active) {
                return null;
            }

            return {
                ...b,
                user: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar,
                    email: user.email,
                    phone: user.phone || null
                }
            };
        })

        // remove null users
        .filter(b => b !== null)

        // 3️⃣ sort
        .sort((a, b) =>
            b.quantity_requested - a.quantity_requested ||
            b.price_per_kg - a.price_per_kg ||
            new Date(a.created_at) - new Date(b.created_at)
        )

        // 4️⃣ add order
        .map((bid, index) => ({
            order: index + 1,
            ...bid
        }));

    const order_and_skip = [];
    const seen = new Set();

    bid_array.map((e) => {
        if (!seen.has(e.buyer_id)) {
            seen.add(e.buyer_id);
            order_and_skip.push(e);
        }
    });
    return order_and_skip;
}


// function createAllocations(product, users, bids, getOrderedBids) {
//     let remainingQty = product.quantity_available;

//     // 1️⃣ Filter bids for this product only
//     let productBids = bids.filter(b => b.product_id === product.id);

//     // 2️⃣ Keep ONLY highest bid per user
//     const bestBidsMap = new Map();

//     for (const bid of productBids) {
//         const existing = bestBidsMap.get(bid.buyer_id);

//         if (!existing) {
//             bestBidsMap.set(bid.buyer_id, bid);
//         } else {
//             if (bid.price_per_kg > existing.price_per_kg) {
//                 bestBidsMap.set(bid.buyer_id, bid);
//             } else if (
//                 bid.price_per_kg === existing.price_per_kg &&
//                 new Date(bid.created_at) > new Date(existing.created_at)
//             ) {
//                 bestBidsMap.set(bid.buyer_id, bid);
//             }
//         }
//     }

//     const filteredBids = Array.from(bestBidsMap.values());

//     // 3️⃣ get ordered winners
//     const orderedBids = getOrderedBids(
//         product.id,
//         users,
//         filteredBids
//     );

//     const allocations = [];

//     // 🧠 TRACK ALREADY ALLOCATED USERS
//     const allocatedUsers = new Set();

//     let order = 1;

//     // 4️⃣ allocate
//     for (const bid of orderedBids) {

//         if (remainingQty <= 0) break;

//         // ❗ SKIP if user already allocated
//         if (allocatedUsers.has(bid.buyer_id)) {
//             continue;
//         }

//         const user = users.find(u => u.id === bid.buyer_id);

//         const allocatedQty = Math.min(bid.quantity_requested, remainingQty);

//         allocations.push({
//             id: order,
//             product_id: product.id,
//             buyer_id: bid.buyer_id,
//             bid_id: bid.id,
//             allocated_quantity: allocatedQty,
//             final_price: allocatedQty * bid.price_per_kg,
//             order: order++,

//             user: {
//                 first_name: user?.first_name,
//                 last_name: user?.last_name,
//                 email: user?.email,
//                 phone: user?.phone || null,
//                 avatar: user?.avatar
//             },

//             created_at: new Date().toISOString()
//         });

//         // mark user as allocated
//         allocatedUsers.add(bid.buyer_id);

//         remainingQty -= allocatedQty;
//     }

//     return allocations;
// }



function createAllocations(product, users, bids, getOrderedBids) {
    let remainingQty = product.quantity_available;

    // 1️⃣ get ordered bids (WINNERS ORDER)
    const orderedBids = getOrderedBids(product.id, users, bids);

    const allocations = [];

    // 2️⃣ allocate
    for (let i = 0; i < orderedBids.length; i++) {
        if (remainingQty <= 0) break;

        const bid = orderedBids[i];

        const allocatedQty = Math.min(bid.quantity_requested, remainingQty);

        allocations.push({
            id: i + 1,
            product_id: product.id,
            buyer_id: bid.buyer_id,
            bid_id: bid.id,
            allocated_quantity: allocatedQty,
            final_price: allocatedQty * bid.price_per_kg + product.deliveryPrice,
            order: i + 1,

            user: {
                first_name: bid.user.first_name,
                last_name: bid.user.last_name,
                email: bid.user.email,
                phone: bid.user.phone || null,
                avatar: bid.user.avatar
            },

            created_at: new Date().toISOString()
        });

        remainingQty -= allocatedQty;
    }

    return allocations;
}

function getExpiredActiveProducts(products) {
    const now = new Date();

    return products.filter(p =>
        p.status === "active" &&
        new Date(p.end_time) <= now
    );
}


module.exports = { getOrderedBids, createAllocations, getExpiredActiveProducts };
