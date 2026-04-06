const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'schema.json');

// Read JSON
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Function to generate random date in 2026
function randomDate(year = 2026) {
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'); // 01-12
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');   // 01-28

    return `${day}-${month}-${year}`;
}

// Function to add 1 year to date (for expire_date)
function addOneYear(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return `${day}-${month}-${parseInt(year) + 1}`;
}

// Update all revenue dates
jsonData.revenue = jsonData.revenue.map(item => {
    const newDate = randomDate();

    return {
        ...item,
        date: newDate,
        exipire_date: addOneYear(newDate)
    };
});

// Save file
fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4), 'utf-8');

console.log('Dates randomized successfully!');
