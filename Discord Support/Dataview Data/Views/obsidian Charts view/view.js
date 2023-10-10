

const pages = input.pages.where((page)=> page.file.day.toFormat(input.current.date_format) === input.current.file.name)
const fileNames = pages.map(p => p.file.name).values
const food = pages.map(p => p.dailystepswalked).values
const mood = pages.map(p => p.dailywordcount).values

const chartData = {
type: 'line',
data: {
labels: fileNames,
datasets: [{
label: 'Food Quality',
data: food,
backgroundColor: [
'rgba(255, 99, 132, 0.2)'
],
borderColor: [
'rgba(255, 99, 132, 1)'
],
borderWidth: 1,
}, {
label: 'Mood',
data: mood,
backgroundColor: [
'rgba(54, 162, 235, 0.2)'
],
borderColor: [
'rgba(54, 162, 235, 1)'
],
borderWidth: 1,
}]
}
}

window.renderChart(chartData, input.container)
