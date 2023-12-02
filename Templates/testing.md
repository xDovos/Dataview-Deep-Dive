
<%*
const fs = require('fs');

// Your JSON data
const jsonData = {ThreeInTen: [...DataviewAPI.page("Raw Data/ThreeInTen Data").ThreeInTen]}
console.log(jsonData)
// Extract headers from the first object in the JSON array
const headers = Object.keys(jsonData.ThreeInTen[0]);

// Create CSV header
const csvHeader = headers.join(',');

// Create CSV rows
const csvRows = jsonData.ThreeInTen.map(obj => {
  const values = headers.map(key => {
    // Wrap arrays in quotes
    return Array.isArray(obj[key]) ? `"${obj[key].join(',')}"` : obj[key];
  });
  return values.join(',');
});

// Combine header and rows
const csv = [csvHeader, ...csvRows].join('\n');

console.log('CSV file has been created.');
-%>
<%csv%>