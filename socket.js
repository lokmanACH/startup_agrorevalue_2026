const { json } = require("body-parser");
const WebSocket = require("ws");
const { readData, writeData } = require("./utils/db");
const { getOrderedBids } = require("./websocket/order_bids");

// create server on port 3000
const wss = new WebSocket.Server({ port: 8000 });

console.log("WebSocket server running on ws://localhost:3000");

// when client connects
wss.on("connection", (ws) => {
    console.log("Client connected");

    // receive message
    ws.on("message", async(message) => {

        data = JSON.parse(message);
        id_product = data.id_product;




        db_for_bids = await readData();
        // select data
        bids = db_for_bids["bids"];
        users = db_for_bids["users"];
        result = getOrderedBids(id_product, users, bids)


        // send back response
        console.log(result);
        
        ws.send(result);
    });

    // send message when connected
    ws.send("Welcome client!");
});
