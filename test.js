const { getOrderedBids, createAllocations } = require("./websocket/order_bids");

// 📦 PRODUCT (IMPORTANT - was missing)
const product = {
    id: 1,
    seller_id: 1,
    title: "Potatoes",
    quantity_available: 400,
    price_full_sale: 12000
};

// 👤 USERS
const users = [
    {
        id: 1,
        first_name: "Ali",
        last_name: "Doe",
        email: "ali@mail.com",
        phone: "0770000001",
        avatar: "https://example.com/a1.jpg",
        is_verified: true,
        is_active: true
    },
    {
        id: 2,
        first_name: "Sara",
        last_name: "Smith",
        email: "sara@mail.com",
        phone: "0770000002",
        avatar: "https://example.com/a2.jpg",
        is_verified: true,
        is_active: true
    },
    {
        id: 3,
        first_name: "Omar",
        last_name: "Ali",
        email: "omar@mail.com",
        phone: null,
        avatar: "https://example.com/a3.jpg",
        is_verified: true,
        is_active: true
    },

    // ❌ ignored user
    {
        id: 4,
        first_name: "Fake",
        last_name: "User",
        email: "fake@mail.com",
        phone: "000",
        avatar: "",
        is_verified: false,
        is_active: true
    }
];

// 💰 BIDS
const bids = [
    {
        id: 1,
        product_id: 1,
        buyer_id: 1,
        quantity_requested: 200,
        price_per_kg: 60,
        created_at: "2026-04-01T10:00:00"
    },
    {
        id: 2,
        product_id: 1,
        buyer_id: 2,
        quantity_requested: 200,
        price_per_kg: 60,
        created_at: "2026-04-01T11:00:00"
    },
    {
        id: 3,
        product_id: 1,
        buyer_id: 3,
        quantity_requested: 300,
        price_per_kg: 40,
        created_at: "2026-04-01T09:00:00"
    },
    {
        id: 13,
        product_id: 1,
        buyer_id: 3,
        quantity_requested: 350,
        price_per_kg: 40,
        created_at: "2026-04-01T09:00:00"
    },
    {
        id: 4,
        product_id: 1,
        buyer_id: 4, // ❌ ignored
        quantity_requested: 200,
        price_per_kg: 60,
        created_at: "2026-04-01T08:00:00"
    },
    {
        id: 5,
        product_id: 2,
        buyer_id: 2,
        quantity_requested: 500,
        price_per_kg: 100,
        created_at: "2026-04-01T07:00:00"
    }
];

// 🏆 RUN ALLOCATION
const allocations = createAllocations(
    product,
    users,
    bids,
    getOrderedBids
);

// 📤 OUTPUT
console.log(JSON.stringify(allocations, null, 2));
