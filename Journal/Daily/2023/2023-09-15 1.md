---
DailyWordCount: 0
DailyStepsWalked: 0
WaterLiter: 0
Pushups: 0
Squats: 0 
Pullups: 0
Bridges: 0
Leg_Raises: 0
Twists: 0
Type: Daily
---
today:: `=link(string(date(today)))`
before:: [[<%tp.date.now("YYYY-MM-DD",-1,tp.file.title,"YYYY-MM-DD")%>]]
after:: [[<%tp.date.now("YYYY-MM-DD",1,tp.file.title,"YYYY-MM-DD")%>]]
weekly:: [[<%tp.date.now("gggg-[W]WW",0,tp.file.title,"YYYY-MM-DD")%>]]
monthly:: [[<%tp.date.now("yyyy-[M]MM",0,tp.file.title,"YYYY-MM-DD")%>]]

# <%tp.date.now("YYYY-MM-DD",0,tp.file.title,"YYYY-MM-DD")%>

<% tp.file.move("/Journal/Daily/2023/"+tp.file.title) %>

## Training
<%*  
const mon = `
- [ ] #training Pushups 
- [ ] #training Leg Raises
- [ ] #training Stretching `
const din = `
- [ ] #training Pullups 
- [ ] #training Squats
- [ ] #training Stretching`
const mit = `
- [ ] #training Bridges 
- [ ] #training Twists
- [ ] #training Stretching`
const don = `
- [ ] #training Pushups 
- [ ] #training Leg Raises
- [ ] #training Stretching`
const fry = `
- [ ] #training Pullups 
- [ ] #training Squats
- [ ] #training Stretching`
const sat = `
- [ ] #training Bridges 
- [ ] #training Twists
- [ ] #training Stretching`
const sun = `
- [ ] #training Resting
- [ ] #training Stretching`
-%>
<%* if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 1){-%>
<% mon -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 2){-%>
<% din -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 3){-%>
<% mit -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 4){-%>
<% don -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 5){-%>
<% fry -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 6){-%>
<% sat -%>
<%*} if (tp.date.now("E",0,tp.file.title,"YYYY-MM-DD") == 7){-%>
<% sun -%>
<%*}-%>

## Tasks
### New Tasks 


### Today's Tasks 

```tasks
tags includes daily
not done 
due on <%tp.date.now("YYYY-MM-DD",0,tp.file.title,"YYYY-MM-DD")%>
```

### Overdue Tasks 

```tasks
tags includes daily
not done 
due before <%tp.date.now("YYYY-MM-DD",0,tp.file.title,"YYYY-MM-DD")%>
```

### Tomorrow's Tasks

```tasks
tags includes daily
not done 
due on <%tp.date.now("YYYY-MM-DD",1,tp.file.title,"YYYY-MM-DD")%>
```

### Dueless Tasks

```tasks
tags includes daily
not done 
no due date
```

## Log

- 





