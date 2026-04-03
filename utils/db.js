const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../db/schema.json');

// A simple task queue to handle concurrency issues
class MutexQueue {
    constructor() {
        this.queue = Promise.resolve();
    }

    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue = this.queue.then(() => task().then(resolve).catch(reject));
        });
    }
}

const dbMutex = new MutexQueue();

/**
 * Safely read the JSON database.
 * @returns {Promise<Object>}
 */
async function readData() {
    return dbMutex.enqueue(async () => {
        try {
            const fileData = await fs.readFile(DB_PATH, 'utf8');
            return JSON.parse(fileData);
        } catch (error) {
            console.error("Error reading database:", error);
            throw new Error("Failed to read database");
        }
    });
}

/**
 * Safely write data to the JSON database.
 * @param {Object} data - The entire database object to save.
 * @returns {Promise<void>}
 */
async function writeData(data) {
    return dbMutex.enqueue(async () => {
        try {
            const fileData = JSON.stringify(data, null, 4);
            await fs.writeFile(DB_PATH, fileData, 'utf8');
        } catch (error) {
            console.error("Error writing database:", error);
            throw new Error("Failed to write to database");
        }
    });
}

module.exports = {
    readData,
    writeData
};
