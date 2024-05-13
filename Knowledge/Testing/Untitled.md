---
person:
  - firstname: Peter
    lastname: Friz
    age: 24
  - firstname: George
    lastname: Lucas
    age: 54
test: "[[Vault#Intro]]"
---


```dataview
Table person, person.firstname, person.lastname, person.age
where file.path = this.file.path
Flatten person as person
```


modal forms plugin


```dataviewjs
console.log(dv.pages().groupBy(t=> t.file.folder))
```
