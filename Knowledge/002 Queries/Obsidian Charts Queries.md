---
aliases: 
Type: Query
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Obsidian Charts Queries", "Status Tasks")`

###### Status Tasks
- [x] Create the Note ✅ 2023-12-22
- [x] Write the YAML metadata ✅ 2023-12-22
- [ ] Write the query


# Obsidian Charts Queries



## Bar charts Habit counter

```dataviewjs  
const pages = dv.pages('"Journal/Daily/2023"')

//console.log(pages)

function summing(habits){
	let yes = 0
	let no = 0
	for (let i in habits){
		//console.log(habits[i])
		if (habits[i] >= 1 ){
			yes++
		}
		if (habits[i] == 0){
			no++
		}
	}
	
	return [yes, no]
}

const squats = summing(pages.map(p => p.squats).values)


const testNames = ["squats"]
const habits = [squats, ]

//console.log(habits)
let yes = habits.map((t) => t[0])
let no = habits.map((t) => t[1])
//console.log(yes)
//console.log(no)

const chartData = {  
    type: 'bar',  
    data: {  
        labels: testNames,  
        datasets: [{  
            label: 'True',  
            data: yes,  
            backgroundColor: [  
                'rgba(255, 99, 132, 0.2)'  
            ],  
            borderColor: [  
                'rgba(255, 99, 132, 1)'  
            ],  
            borderWidth: 1,  
	        },
	        {  
            label: 'False',  
            data: no,  
            backgroundColor: [  
                'rgba(0, 99, 132, 0.2)'  
            ],  
            borderColor: [  
                'rgba(0, 99, 132, 1)'  
            ],  
            borderWidth: 1,  
        }]  
    }  
}  
  
window.renderChart(chartData, this.container)  
```

## Line Charts Csv
(broken. no csv)
```dataviewjs  
let data = await dv.io.csv("999 Attachments/user_hr_data_2023-01-28_14.36.12.csv")
let tick = data.map(t=> t.sec).array()
let HR_BPM = data.map(t=> t.hr_bpm).array()
console.log(HR_BPM)

const chartData = {  
    type: 'line',  
    data: {  
        labels: tick,
        datasets: [{
            label: 'True',
            data: HR_BPM,
            backgroundColor: [  
                'rgba(255, 99, 132, 0.2)'  
            ],  
            borderColor: [  
                'rgba(255, 99, 132, 1)'  
            ],  
            borderWidth: 1,
	        }]  
    },
    options: {
        Display: false,
        TickDisplay: false
    }  
}  
  
window.renderChart(chartData, this.container)  
```


## line chart daily note
```dataviewjs  
let data = dv.pages('"Journal/Daily/2023"')
//console.log(data)
let dates = data.map(t=> t.file.name).array()

let squats = data.map(t=> t.squats).array()
//console.log(steps)

const chartData = {  
    type: 'line',  
    data: {  
        labels: dates,
        datasets: [{
            label: 'Squats',
            data: squats,
            backgroundColor: [  
                'rgba(255, 99, 132, 0.2)'  
            ],  
            borderColor: [  
                'rgba(255, 99, 132, 1)'  
            ],  
            borderWidth: 1,
	        }]  
    }
    
}  
  
window.renderChart(chartData, this.container)  
```


## pie chart random colors



```dataviewjs
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `${r},${g},${b}`;
}

const names = {"Work": "30", "Sleep": "73", "Breakfast": "3"};

let datasets = [];
const randomColor = getRandomColor();
const randomColor2 = getRandomColor();
const randomColor3 = getRandomColor();
datasets.push({
    "data": Object.values(names), 
    "backgroundColor": [`rgba(${randomColor}, 0.2)`, `rgba(${randomColor2}, 0.2)`, `rgba(${randomColor3}, 0.2)`],
    "borderColor": [`rgba(${randomColor}, 1)`, `rgba(${randomColor2}, 1)`, `rgba(${randomColor3}, 1)`]
})

let chartData = {
    type: 'pie',
    data: {
        labels: Object.keys(names),
        datasets: datasets
    }
};
window.renderChart(chartData, this.container)  
```


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```
