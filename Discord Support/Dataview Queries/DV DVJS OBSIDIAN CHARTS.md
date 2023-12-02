---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: "[[DV DVJS OBSIDIAN CHARTS#DV DVJS OBSIDIAN CHARTS BAR boolean Habit counter]]"

---

## DV DVJS OBSIDIAN CHARTS BAR boolean Habit counter

```dataviewjs  
const pages = dv.pages('"Journal/Daily"').where(t => t.file.day >= dv.luxon.DateTime.fromFormat("2023-01-01" , "yyyy-MM-dd"))

//console.log(pages)

function summing(habits){
	let yes = 0
	let no = 0
	for (let i in habits){
		//console.log(habits[i])
		if (habits[i] == true ){
			yes++
		}
		if (habits[i] == false){
			no++
		}
	}
	
	return [yes, no]
}

const lunch = summing(pages.map(p => p.lunch).values)


const testNames = ["Lunch"]
const habits = [lunch, ]

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

## DV DVJS OBSIDIAN CHARTS CSV

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

```dataviewjs  
let data = dv.pages('"Journal/Daily/2023"')
//console.log(data)
let dates = data.map(t=> t.file.name).array()

let steps = data.map(t=> t.DailyStepsWalked).array()
//console.log(steps)

const chartData = {  
    type: 'line',  
    data: {  
        labels: dates,
        datasets: [{
            label: 'steps',
            data: steps,
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


