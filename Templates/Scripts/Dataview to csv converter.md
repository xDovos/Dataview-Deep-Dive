<%*
const dv = this.app.plugins.plugins.dataview.api;
const dql = await dv.tryQueryMarkdown(`
TABLE WITHOUT ID L.Name as Name, L.Location as Location, L.Wattage as Wattage
FROM "Untitled 2"
FLATTEN file.lists as L
`)
console.log(dql)
// Remove leading and trailing whitespaces from each line
const cleanedString = dql.trim();

// Split the string into an array of lines
const lines = cleanedString.split('\n');

// Extract header and data rows
const [headerRow, separatorRow, ...dataRows] = lines;

// Remove leading and trailing pipes and whitespaces from header
const headers = headerRow.split('|').map(header => header.trim()).filter(Boolean);

// Process data rows and convert them to CSV format
const csvData = dataRows.map(row => {
  const rowData = row.split('|').map(data => data.trim()).filter(Boolean);
  return rowData.join(',');
}).join('\n');

// Combine headers and CSV data
const csvResult = `${headers.join(',')}\n${csvData}`;

console.log(csvResult);
%>
<%csvResult%>