const xlsx = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = xlsx.readFile('results.xls');
const sheetName = workbook.SheetNames[0]; // Assume the first sheet
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const data = xlsx.utils.sheet_to_json(sheet);

// Save as JSON file
fs.writeFileSync('results.json', JSON.stringify(data, null, 2));
console.log('Excel file converted to JSON successfully.');
