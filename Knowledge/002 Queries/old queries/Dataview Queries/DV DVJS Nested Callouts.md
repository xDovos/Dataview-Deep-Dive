
---
Type: Dataview
QueryType: DVJS
tags: [DV/DVJS, DV/Query]
self: ["[[DV DVJS Nested Callouts#DV DVJS Nested Callouts based on depth]]", ""]
---
docs:: 

## DV DVJS Nested Callouts based on depth
- [ ] Task #test
- [ ] task2 #test
- [ ] task2.1 #test
- [ ] task3 #test/sub1
- [ ] task5 #test/sub1
- [ ] task4 #test/sub2
- [ ] task6 #test/sub1/zet1
- [ ] task7 #test/sub3
- [ ] task #tag2 


```dataviewjs
function pad(group){
    return "".padStart(group.split(" ")[0], ">")
}

function depthStyle(depth){
    //console.log(depth)
    switch(Number(depth)){
    case 1:
        return "[!note]+ "
    case 2:
        return "[!Success]- "
    case 3:
        return "[!info]- "
    default:
        return "[!note]+ " 
}}

const tasks = dv.current().file.tasks
let groups = tasks.groupBy(t=> t.tags[0].split("/").length + " " + t.tags).sort(t=> t.key.split(" ")[1], "asc")
let md = ''
for (let group of groups) {
    let calloutfix =  "".padStart(group.key.split(" ")[0]-1, ">")+ '\n'
    let callout = pad(group.key) + "" + depthStyle(group.key.split(" ")[0]) +" "+ group.key.split(" ")[1] + "\n"
    let start = pad(group.key) + '```dataviewjs\n'
    let code = pad(group.key) + 'let group2 = dv.array(JSON.parse(`'+ JSON.stringify(group.rows.array()) +'`));\n'
    let end  = pad(group.key) + 'dv.taskList(group2, false);\n'
    let codeEnd = pad(group.key) + '```\n'
    md+= calloutfix + callout + start + code + end + codeEnd
}

dv.span(md)
```















