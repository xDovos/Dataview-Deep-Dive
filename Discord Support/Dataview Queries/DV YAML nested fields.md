---
person:
 - firstname: "Peter"
 - lastname: "Fritz"
 - age: 24
 - firstname: "George"
 - lastname: "Lucas"
 - age: 54
person2:
  firstname: "Peter"
  lastname: "Fritz"
  age: 24
  firstname: "George"
  lastname: "Lucas"
  age: 54
person3:
  - firstname: "Peter"
    lastname: "Fritz"
    age: 24
  - firstname: "George"
    lastname: "Lucas"
    age: 54
---

## Person 1
```dataview
Table person, person.firstname, person.lastname, person.age
where file.path = this.file.path

```
```dataview
Table person, person.firstname, person.lastname, person.age
where file.path = this.file.path
Flatten person as person
```

## Person2

```dataview
Table person2, person2.firstname, person2.lastname, person2.age
where file.path = this.file.path

```
- The first set of data is overwritten by the second mention of the sub fields.
```dataview
Table person2, person2.firstname, person2.lastname, person2.age
where file.path = this.file.path
Flatten person2 as person2
```
## Person3
```dataview
Table person3, person3.firstname, person3.lastname, person3.age
where file.path = this.file.path

```
```dataview
Table person3, person3.firstname, person3.lastname, person3.age
where file.path = this.file.path
Flatten person3 as person3
```

