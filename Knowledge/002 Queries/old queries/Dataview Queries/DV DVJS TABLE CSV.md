---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["", ""]
---
docs:: 








```dataviewjs
const myData = await dv.io.csv("Discord Support/Dataview Data/curriculum-obsidian.csv")
const headers = ["Courses","Topic","Duration","Effort","Total Hours Lower Bound","Start Date","End Date Estimate Lower Bound","Total Hours Upper Bound","Start Date","End Date Estimate Upper Bound","Actual End Date","Prerequisites","Alternative courses"]
console.log(myData)
dv.table(headers , myData.map(x=> [x.Courses,
								x.Topic,
								x.Duration,
								x.Effort,
								x["Total Hours Lower Bound"],
								x["Start Date"],
								x["End Date Estimate Lower Bound"],
								x["Total Hours Upper Bound"],
								x["Start Date"],
								x["End Date Estimate Upper Bound"],
								x["Actual End Date"],
								x.Prerequisites,
								x["Alternative courses"]]))
```









