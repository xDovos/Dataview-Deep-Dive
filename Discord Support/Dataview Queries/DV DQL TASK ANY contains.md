---
Alias: ["Hello", "Apple"]
Type: Dataview
QueryType: DQL
#tags: [DV/DQL, DV/Query]
self: ["",""]
array1:  ["apples"]
array2: [ "apples", "haus", "Peter"]
---
docs::


## DV DQL TASK ANY contains


- [ ] #üeter apple
- [ ] #todo peter
- [ ] #p1 #todo Hello
- [ ] #p1 Untitled
- [ ] Hans


```dataview
TASK 
WHERE contains(lower(text), lower(this.file.name)) or any(lower(this.file.aliases), (t) => contains(lower(text), t)) 
WHERE !completed

```
name:: 3

```dataview
TABLE choice(typeof(array1) = "array", any(array1, (t)=> contains(this.array2, t)), contains(this.array2, array1)),
    default(((x) => {"array":any(array1, (t)=> contains(this.array2, t)), "number":"is a number", "string": "is a sting" }[x])(typeof(array1)), "99"), typeof(array1), (x) => {"null": null,"string": "NaN", "number": this.name - 5}[typeof(this.name)](x)
where file.path = this.file.path
```


```js dataviewjs
const questiontasks = dv.pages().where(t=> dv.func.contains(["x"], "x")).file.tasks?.where(t=> t.status ==="x").length
console.log(questiontasks)
```

```dataview
table T.text, T.tags
where file.path = this.file.path
flatten file.tasks as T

```





[]


```js dataview
TASK
WHERE contains(tags, "#task") and contains(tags, "#main") and !completed and 

any(list("#publish-phase", "#reviewer-phase", "editor-phase", "impact-phase", "#advisor-advice/Songi", "#collaborator-advice/Asif", "#collaborator-advice/Elena", "#submission-guidelines", "#my-advice"), (t)=> contains(tags, t))

```



















