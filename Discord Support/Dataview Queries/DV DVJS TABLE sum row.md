---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: "[[DV DVJS TABLE sum row#DV DVJS TABLE Sum Row with counting of words inside a field]]"
---
Docs::


## DV DVJS TABLE Sum Row with counting of words inside a field

```dataviewjs

const data = dv.pages('"Discord Support"')
        .where(t=>t.eyes)
        .groupBy(t=>t.eyes)
        .map((t)=>[t.key, t.rows.eyes.length])

//console.log(data)

// adding another row with the sum of the count.
let test = []
for (let i of data.values){
	test.push(i[1])
}
const sum = test.reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

let hrArray = Array(data.values[1].length).fill('<hr style="padding:0; margin:0 -10px;">');
data.values.push(hrArray)


data.values.push(["SUM", sum])


//console.log(data)
dv.table(["Couleur", "Total"], data)
```

## DV DVJS TABLE sum Row 

```dataviewjs

const data = dv.pages('"Discord Support/Dataview Data"')
        .where(t=>t.DailyWordCount)
        .map((t)=>[t.file.link, t.DailyWordCount])

//console.log(data)

// adding another row with the sum of the count.
let test = []
for (let i of data.values){
	test.push(i[1])
}
const sum = test.reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

let hrArray = Array(data.values[1].length).fill('<hr style="padding:0; margin:0 -10px;">');
data.values.push(hrArray)


data.values.push(["SUM", sum])


//console.log(data)
dv.table(["Link", "DailyWordCount"], data)
```

```js dataviewjs
// Construct the table data
const data = dv.pages('"Singapore/Insurance"')  // FROM "Singapore/Insurance"
  .where( t => t.Status === "Active")  // WHERE Status = "Active"
  .map((t) => [t.file.link, t.Insured, t. Insurer, t.Premium, t.Giro, t.CreditCard, t["CPF-OA"], t.MediSave])

// Function for summing a column
function sum(index) {
  let values = []
  // Put the data from a column into an array
  for (let i of data.values){
    values.push(i[index])
  }
  // Use array reduce to sum the numbers
  const sum = values.reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);
  // Return formated number
  return parseFloat(sum).toFixed(2);
}

let sumPremium = sum(3)
let sumGiro = sum(4)
let sumCreditCard = sum(5)
let sumCPFOA = sum(6)
let sumMediSave = sum(7)

// adding a dividing line
let hrArray = Array(data.values[1].length).fill('<hr style="padding:0; margin:0 -10px;">');
data.values.push(hrArray)

// adding a row to the table with the sums
data.values.push(["SUM", "", "", sumPremium, sumGiro, sumCreditCard, sumCPFOA, sumMediSave])

// Render the table, including headers and table data
dv.table(["Link", "Insured", "Insurer", "Premium", "Giro", "CreditCard", "CPF-OA", "MediSave"], data)
```

## DV DVJS TABLE sum and avarage
```js dataviewjs
function total(arr) {
  return arr.array().reduce((partialSum, element) => partialSum + element, 0);
}

function average(arr, pages) {
  return total(arr) / pages.length;
}

let pages = dv.pages('#testme');

let work = pages.map(p => p.work ? p.work : 0);
let sleep = pages.map(p => p.sleep ? p.sleep : 0);
let steps = pages.map(p => p.steps ? p.steps : 0);

dv.table(
  ["t.work", "a.work", "t.sleep", "a.sleep", "t.steps", "a.steps"], 
  [[total(work), average(work, pages), total(sleep), average(sleep, pages), total(steps), average(steps, pages)]]
);
```
 hello
```dataviewjs
const DQL = await dv.tryQuery(`
  Table without id link(file.link, dateformat(file.day,"yyyy-MM-dd - cccc")) as "Day" , dailystepswalked
    From "Journal/Daily/2023"
        where dateformat(file.day,"kkkk-'W'WW") = this.file.name
    sort file.day
  `)
function avarege(data, colm){
    let temp = 0
    for(let i in data){
        temp += data[i][colm]
    }
    //console.log(temp, data.length)
    return temp/data.length
}
let data = DQL.values
let colm1 = avarege(data, 1)
let hrArray = Array(data[1].length).fill('<hr style="padding:0; margin:0 -10px;">');
data.push(hrArray)

data.push(["Avarege", colm1])
dv.table(DQL.header, data)
```

```dataview

table without id row0.file.link, row0.DailyStepsWalked
from "Journal/Daily"
where dateformat(file.day, "yyyy-'M'MM") = "2023-M02"
sort file.day desc
group by ""
flatten [flat([rows, [{
    file: { link: "Average" },
    DailyStepsWalked: average(rows.DailyStepsWalked)
}]])] AS rows
flatten rows AS row0
```
