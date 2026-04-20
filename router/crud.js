const express = require('express');
const { readData, writeData } = require('../utils/db');

const router = express.Router();

/**
 * Middleware to check if the requested entity (table/collection) exists in the database.
 */
async function checkEntityExists(req, res, next) {
    const { entity } = req.params;
    try {
        const db = await readData();
        if (!db[entity]) {
            // Optional: Auto-create the entity array if it doesn't exist
            // db[entity] = [];
            // await writeData(db);
            // return next();
            return res.status(404).json({ error: `Entity '${entity}' not found.` });
        }
        req.db = db;
        req.entityData = db[entity];
        next();
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
}

// GET /api/:entity -> Read all records
router.get('/:entity', checkEntityExists, async (req, res) => {
    res.json(req.entityData);
});

// GET /api/:entity/:id -> Read a specific record
router.get('/:entity/:id', checkEntityExists, async (req, res) => {
    const { id } = req.params;
    // We try parsing ID as number first, then fallback to string if needed
    const record = req.entityData.find(item => item.id == id);
    
    if (!record) {
        return res.status(404).json({ error: `Record with id ${id} not found.` });
    }
    
    res.json(record);
});

// POST /api/:entity -> Create a new record
router.post('/:entity', checkEntityExists, async (req, res) => {
    try {
        const newRecord = { ...req.body };
        
        // Auto-generate numeric ID if not provided
        if (!newRecord.id) {
            const maxId = req.entityData.reduce((max, item) => {
                const numId = parseInt(item.id, 10);
                return !isNaN(numId) && numId > max ? numId : max;
            }, 0);
            newRecord.id = maxId + 1;
        }

        // Generate creation date automatically if applicable
        if(!newRecord.created_at) {
            newRecord.created_at = new Date().toISOString();
        }

        req.entityData.push(newRecord);
        await writeData(req.db);
        
        // If a new bid was placed, broadcast updated ordered bids to all watching clients
        if (req.params.entity === 'bids' && newRecord.product_id) {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(newRecord.product_id));
            } catch (err) { /* silent fail if socket not started */ }
        }

        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: "Failed to create record" });
    }
});


// PUT /api/:entity/:id -> Update a record partially (as requested)
router.put('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        // Merges existing object with body instead of replacing entirely
        req.entityData[index] = { ...req.entityData[index], ...req.body, id: req.entityData[index].id };
        await writeData(req.db);

        // Notify subscribers if this is a product update
        if (req.params.entity === 'products') {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        res.json(req.entityData[index]);
    } catch (error) {
        res.status(500).json({ error: "Failed to update record" });
    }
});

// PATCH /api/:entity/:id -> Update partially a record
router.patch('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        // Merges existing object with body
        req.entityData[index] = { ...req.entityData[index], ...req.body, id: req.entityData[index].id };
        await writeData(req.db);

        // Notify subscribers if this is a product update
        if (req.params.entity === 'products') {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        res.json(req.entityData[index]);
    } catch (error) {
        res.status(500).json({ error: "Failed to update record partially" });
    }
});

// DELETE /api/:entity/:id -> Delete a record
router.delete('/:entity/:id', checkEntityExists, async (req, res) => {
    try {
        const { id } = req.params;
        const index = req.entityData.findIndex(item => item.id == id);

        if (index === -1) {
            return res.status(404).json({ error: `Record with id ${id} not found.` });
        }

        const deletedRecord = req.entityData.splice(index, 1)[0];
        await writeData(req.db);

        // Notify subscribers if this was a product delete
        if (req.params.entity === 'products') {
            try {
                const { broadcastBidsUpdate } = require('./socket');
                broadcastBidsUpdate(Number(id));
            } catch (err) {}
        }

        res.json({ message: "Record deleted", deleted: deletedRecord });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete record" });
    }
});

module.exports = router;
