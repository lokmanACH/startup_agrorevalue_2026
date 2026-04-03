const fs = require("fs");

const data = JSON.parse(fs.readFileSync("schema.json", "utf-8"));

// for (const tableName in data) {
//   console.log(`\n=== ${tableName} ===`);

//   const records = data[tableName];

//   if (Array.isArray(records) && records.length > 0) {
//     const keys = Object.keys(records[0]);

//     console.log("Keys:", keys);
//   } else {
//     console.log("No data");
//   }
// }

for (const tableName in data) {
  console.log(tableName);
}