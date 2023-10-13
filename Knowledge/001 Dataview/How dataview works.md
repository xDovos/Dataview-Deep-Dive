---
Alias:  
names: ["Hans", "peter"]
Type: Literature
Dataview: 
---
MOC:: 
up:: 
same::
status::  `$= const setPage = "How dataview works"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] Write the Intro ✅ 2023-03-24
- [x] Write the YAML metadata ✅ 2023-03-24
- [ ] Go through everything again and place hint callouts if needed.
- [ ] have dp0z read over it and correct code mistakes. especially the dvjs part.
- [ ] have AB1908 read over it.
- [x] Metadata ✅ 2023-03-24
    - [x] Importance of structure/setup ✅ 2023-03-24
    - [x] Datasets ✅ 2023-03-24
        - [x] inside the YAML ✅ 2023-03-24
            - [x] JSON like ✅ 2023-03-24
            - [x] YAML equivalent ✅ 2023-03-24
        - [x] inline with file.lists ✅ 2023-03-24
    - [x] file.lists/tasks ✅ 2023-03-24
    - [x] current note ✅ 2023-03-24
        - [x] DQL this. ✅ 2023-03-24
        - [x] Dvjs dv.current ✅ 2023-03-24
- [ ] DQL 
    - [x] query types ✅ 2023-04-15
        - [x] list ✅ 2023-04-15
        - [x] table ✅ 2023-04-15
        - [x] task ✅ 2023-04-15
        - [x] calendar ✅ 2023-04-15
    - [ ] Commands
        - [x] FROM ✅ 2023-03-24
        - [x] WHERE ✅ 2023-03-24
        - [ ] FLATTEN
            - [x] on a single value ✅ 2023-03-24
            - [ ] on an array
            - [ ] on an object (file.lists/tasks)
            - [ ] with calculation on a single value
            - [ ] with calculation on an array
            - [ ] functions in flatten
            - [ ] multiple FLATTEN
        - [x] GROUP BY ✅ 2023-03-24
            - [x] rows. ✅ 2023-03-24
            - [x] Expression ✅ 2023-03-24
        - [x] SORT ✅ 2023-03-24
            - [x] Standard Sort ✅ 2023-03-24
            - [x] Custom sort ✅ 2023-03-24
    - [x] Functions ✅ 2023-04-01
        - [x] contains() ✅ 2023-03-25
        - [x] map() ✅ 2023-03-25
        - [x] filter() ✅ 2023-03-31
        - [x] RegEx ✅ 2023-03-31
        - [x] string() ✅ 2023-03-25
        - [x] number() ✅ 2023-03-25
        - [x] math ✅ 2023-03-25
        - [x] link() ✅ 2023-03-31
        - [x] embed() ✅ 2023-03-31
        - [x] default() ✅ 2023-04-01
        - [x] choice() ✅ 2023-04-01
    - [x] Dates ✅ 2023-04-01
        - [x] date() ✅ 2023-04-01
        - [x] dateformat() ✅ 2023-04-01
        - [x] dur() ✅ 2023-04-01
        - [x] calculation ✅ 2023-04-01
- [ ] DVJS 
    - [x] console is your best friend ✅ 2023-04-08
    - [ ] Structure
        - [x] DataArray vs js Array ✅ 2023-04-15
        - [ ] end array for 
            - [x] Table ✅ 2023-04-08
            - [x] Lists ✅ 2023-04-15
            - [x] TaskList ✅ 2023-04-17
            - [ ] Text
        - [x] arrow function ✅ 2023-04-15
    - [ ] Functions()
        - [x] dv.page() ✅ 2023-04-15
        - [x] dv.pages() ✅ 2023-04-15
        - [x] where()/filter() ✅ 2023-04-15
        - [x] map() ✅ 2023-04-15
        - [x] flat() ✅ 2023-04-15
        - [ ] groupBy
        - [x] dv.tryQuery ✅ 2023-04-15
        - [x] dv.view() ✅ 2023-04-15
        - [x] custom functions ✅ 2023-04-15
    - [x] Objects ✅ 2023-04-15
        - [x] Dates ✅ 2023-04-15
            - [x] Luxon ✅ 2023-04-15
            - [x] moment.js ✅ 2023-04-15
            - [x] Better diff function ✅ 2023-04-15
- [x] Inline code and Code hacks ✅ 2023-04-15
    - [x] Progress Bars ✅ 2023-04-15
    - [x] DQL Table with Tasks ✅ 2023-04-15
- [x] Dataviewjs inside Templater ✅ 2023-04-15

# How Dataview works



## Doc links and their section.


```dataview
Table rows.L.docs as Docs
Where file.path = this.file.path
Flatten file.lists as L
where L.docs
Group by L.section as Section
```

## Intro
- This is a try to explain dataview a bit better than what the docs are currently doing. I won't explain every function that dataview has. Only the most used ones that you need to understand when you want to learn to write the queries yourself.
- It will be more focused on the functionality, than what you could do with it and it won't replace the need to read the docs. it is just additional information that bases on that you read the linked docs pages.
- I will try to explain how FLATTEN and GROUP BY works and the basics you need to know about dvjs.
- I will refer to the \`\`\`dataview codeblock as DQL (Data Query Language) and to the \`\`\`dataviewjs as dvjs 

>[!warning] 
>I'm NOT a coder myself and all knowledge i have about Javascript is from learning dvjs on the Obsidian Discord server. I'm only able to somewhat understand what I'm doing because i had Computer science (german: Informatik ) in school for a few years, but we barely got through the basics of Python tkinter and the turtle. so i won't give you any magic tips that makes your code faster, bug free or self assembling/writing. That said, all of the information i provide here should be correct.

## Metadata
- docs:: [adding metadata](https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/)
- docs:: [metadata on Pages](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-pages/)

### Importance of structure/setup

In many tutorials or block posts about dataview, the metadata setup is either ignored or explained within 3 minutes. the problems with that is that it is actually more important than the queries. the right setup makes the difference between a 100 lines dvjs code and a sub 5 lines DQL code. both queries would have similar results but the starting point is different.
one important point about metadata is that you should never put more than one information into one metadata field.
what i mean with that is that you shouldn't have:

\---
address: "street 1, 19581 place/city."
\---

because then it will be super hard to use that field to do query condition with it because you would need to dynamically isolate the wanted information first and that can be surprisingly hard and often needs RegEx for it. 
a better way of doing it would be as separate fields if you have one set per note or as dataset with multiple ones per note. 

\---
street: "street"
streetNr: 1
postcode: 19581
city: "excity"
\---

doing it like this is better because then you have direct access to each part of the information and you don't have to separate it first inside the codeblock.

### inline Metadata

you can add metadata inline with 
inlineField:: "Value"
on it's own line or with [shownInlineKey:: "Value"] or (hiddenInlineKey:: "Value"). the difference is only apparent in Reading view. how it will be rendered is depending on your theme and css snippets.

### Datasets 
With datasets i mean multiple instances of the same information that can't be inside an array. like a note with a lookup table or a daily note mood tracking with time, mood and situation data per entry. datasets can be done inside the frontmatter or inside the note.

#### inside the YAML/frontmatter
##### Yaml Syntax
doing datasets inside the frontmatter is done by choosing a base field name and then to use 2 space to indent to set sub fields. Note: Tabs break the YAML syntax. 
\---
mood:
&nbsp&nbsp\- time: "5:50pm "
&nbsp&nbsp&nbsp&nbspmood: 8
&nbsp&nbsp&nbsp&nbspsituation: "writing this text"
&nbsp&nbsp\- time: "6:00pm"
&nbsp&nbsp&nbsp&nbspmood: 9
&nbsp&nbsp&nbsp&nbspsituation: "finished writing this"
\---

##### Json like
the JSON version is similar. you pick a base field, but then you put a JSON object inside.
\---
mood: \[
&nbsp&nbsp&{time: "5:50pm", mood: 8, situation: "writing this text"},
&nbsp&nbsp&{time: "6:00pm", mood: 9, situation: "finished writing this"}
]
\---

The JSON version has the advantage that it is denser and you can write it inside excel and import it here or copy paste a JSON file in here. useful for big lookup tasks 
#### inline with file.lists

another way of doing datasets is inline with bullet point lists or tasks by using inline fields inside them like
- [time:: "5:50pm"], [mood:: 8], [situation:: "writing this text"]
- [time:: "5:50pm"], [mood:: 9], [situation:: "finished writing this"]
you can also use () instead of []. then it is hiding the key in the reading view. how exactly it looks like in reading view depends on your theme and css snippets.

### file.lists/tasks
- docs:: [Metadata Lists/Tasks](https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/)

file.lists has both bullet point lists and numbered lists inside of it and it has the tasks inside of it too.
this field is important if you work with lists inside the DQL queries. it is almost always required to use "FLATTEN file.lists as L" to work with them. more info about that below in [[How dataview works#FLATTEN]]
file.tasks is just the tasks that are inside file.lists. the only difference in the metadata is file.lists.task = true for tasks.
for further more exact info refer to the docs



### Current note

To access the metadata of the current note, it is important to know if you are in DQL or in dvjs. 
in DQL it is this.field 
in dvjs you have dv.current().field
the reason why it isn't "this." in dvjs is that "this." is pointing at the obsidians base "app." object. (not relevant to the usage of dataview(js). it is only used in very advanced code when you want to access other plugins or obsidians api)

## DQL
### Basic structure of DQL
- docs:: [DQL Structure](https://blacksmithgu.github.io/obsidian-dataview/queries/structure/)
- docs:: [DQL Basic Query builder](https://s-blu.github.io/basic-dataview-query-builder/)
- docs:: [Danny Hatcher Basic Query builder Tutorial](https://www.youtube.com/watch?v=ZMPp1wqAjF8)

the reworked docs page explains it quite good and is basically a must read to get the basics.
after reading it you can use the Query builder to get your first basic queries that show your data without changing it. it is really useful to learn the basic structure.


#### computation order
- the Header line is the last one to be run.
- then it is from top to bottom one line at a time.
- that means that you have to mentally keep track of how your data looks like at the time of the line you are working on. that is important when you use FLATTEN and or GROUP BY 

### Query Types 

#### LIST 
- docs:: [DQL LIST](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#list)

```js dataview
LIST 
FROM ""
```

This basic query gives you all files inside the subfolder.

#### TABLE
- docs:: [DQL TABLE](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#table)

```js dataview
TABLE file.ctime as "ctime", file.mtime as "mtime"
FROM ""
```

this query gives you back the same files but in table view. also it can return more than one metadata field.

#### TASK
- docs:: [DQL TASK](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#task)

```js dataview
TASK
FROM ""
WHERE !completed
GROUP BY file.link
```

This query gives you back all uncompleted Tasks inside the folder and groups it by the files they are in.

#### CALENDAR
- docs:: [DQL CALENDAR](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#calendar)

```js dataview
CALENDAR file.ctime
FROM "Folder/Subfolder"
```

This Query Type is buggy at best. most of the time you see it rendered twice and it might not work for you at all depending on your theme.
if you really want to have a calendar, you should use another plugin like the "calendar", "Full Calendar" or "Projects" or any other calendar plugin that is out there.

### Commands

#### FROM
- docs:: [commands FROM](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#from) 
- docs:: [Sources for FROM](https://blacksmithgu.github.io/obsidian-dataview/reference/sources/)

FROM is a weird one. it only accepts direct Strings like 'FROM "fodler"' it won't accept any fields including this.file.folder or string manipulation. the reason for that is that FROM is selecting what files the query is looking at and is done as first step before the metadata is loaded, thus you can't access it. 
FROM in itself is optional and not using it is equal to FROM "" and chooses all files. 
FROM HAS to be on the first line after the headers 

#### WHERE
- docs:: [commands Where](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#where)
- docs:: [Datatypes](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)
- docs:: [Expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)
- docs:: [DQL functions](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/)

Where works like an IF condition on the files selected by the FROM. 
you can use logic (AND, OR, =, !=, >=, <=, !field (field != nullish)) ,functions, metadata, array and string manipulation inside it.  
you can use as many as you want. if you use multiple behind each other then it is like using an AND between them. 
it is sometimes better to use two where instead of AND if you want to make sure a field is present (important for nested metadata conditions).

```js dataview
TABLE
FROM ""
WHERE field
WHERE field.nestedfield = "Hello"
```

Where can be used anywhere in the query after the FROM if present.
It is your main way of filtering your data inside DQL.
one of the most important functions for the WHERE is [[How dataview works#contains()]]

>[!note]+ 
>The datatype has to match or it will return false. That means you can't compare:
>array and String
>number and string 
>date and string/number
>link and string
>that means often that you have to convert one of the values into the other datatype before the WHERE works as expected

>[!hint]- 
>In some cases you want to use the filter() function inside the header to filter an Array without affecting the remaining data. more to that here [[How dataview works#filter()]]

#### FLATTEN
- docs:: [command Flatten](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#flatten)
- docs:: [Expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)
- docs:: [Datatypes](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/)

in short, FLATTEN is black magic. it is really powerful but really confusing if you don't know the unwritten rules to it.
it is a function that shouldn't exist the way it does because it is doing 3-5 things at once on all your queried data and the Datatype it is used on changes what it spits out and it determines if you can use only one or multiple ones.

in general Flatten works by using
FLATTEN \<expression> as \<alias>

you don't have to name the results of flatten but it is advised to do so if you want to use the results of it somewhere else.
you have to use the newFieldName you choose if you want to see the results. BUT the rows are still affected even if you don't show the newFieldName as a header, so be careful how, when and where in the query you use the command.
you can use multiple fields, math, functions, array and string manipulation and html code in it, but the more complex you make it, the more likely it is that it doesn't do what you expect it to do and it is a pain to debug DQL because no real debug tool exists for it.
keep it as simple as possible until you understand how it reacts.

##### on a single Value
If you use Flatten on a single Value it doesn't change the rows of the query and affects only the metadata field you used it on.
In general it is possible to use multiple flatten if you only use it like this
That is useful for example if you want to calculate the next birthday and his/her age based on the actual birthday date.

###### Example

```js dataview
TABLE DOB, WillBe, On
FROM "Discord Support/Dataview Data"
WHERE DOB and !DOD
FLATTEN date(today).year - DOB.year AS ThisYearAge
FLATTEN DOB + dur(string(ThisYearAge) + " years") AS ThisBDay
FLATTEN choice(ThisBDay > date(today), ThisYearAge, ThisYearAge+1) AS WillBe
FLATTEN choice(ThisBDay > date(today), ThisBDay, ThisBDay + dur("1 year")) AS On
SORT NextBDay
```
DOB = DateOfBirth
DOD = DateOfDeath (optional)

##### on an array
Flatten on an array is where the black magic begins.
it creates a new row for each value inside the array. that means all other columns still have the same values for each of the new rows but the flattened column has a different one. this can be intended or not. it is also why group by is often used to recombine the rows after using a where on the flattened rows.

 


##### on an object (file.lists/tasks)



##### with calculations on a single value

##### with calculations on an array

##### functions in FLATTEN

#### GROUP BY
- docs:: [command Group by](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#group-by)

Group By drastically changes the rows of your query  

##### Rows.
if you use GROUP BY you need to add a "rows." before all fields inside the **header** and commands **after** the group by line to be able to access the metadata of the group. 

##### Expression
you can use expressions inside the group by but it is rarely needed. 

It is mostly used like
GROUP BY city as "City"

to group the notes by that field and name the header "City".
you can also use 

\`\`\`dataview
TABLE WITHOUT ID rows.name, City 
where city
Group By city as "City"
\`\`\`

to have the Group column as second column or any later. that is the only case where you don't need rows. before the header field.


#### SORT
- docs:: [command Sort](https://blacksmithgu.github.io/obsidian-dataview/queries/data-commands/#sort)

Sort is a pretty easy one compared to the other stuff.
Note: Sort only affects Rows and doesn't sort Array Values inside a TABLE Cell
you have the standard sort like
SORT Mood ASC/DESC
you can also use functions inside it but you have to be careful that it doesn't lose it's knowledge about what to sort.

##### Custom sort

There are two good ways to custom sort your rows
you can either chain link choice() functions or use a default() function like

\`\`\`
SORT default(((x) => {
"Drama":1, 
"Crime":2,
"Horror": 3,
"Comedy": 4,
"Thriller": 5,
"Science-Fiction": 6
}[x])(field_to_sort), "99") ASC
\`\`\`
where field_to_sort is the field you want to sort by.
the Genres are an example of how to add values to it. note: upper/lower case does matter.

### Functions

This section is explaining some of the available functions with a bit more detail than the docs do.

#### math
- docs:: [DQL function Math](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#numeric-operations)
- docs:: [DQL expressions](https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/)

in DQL you can use the basic math operations (+,-,\*,/) and a few numeric functions you can find in the docs. there is no function for square roots or power. i'm not sure why. if you need to do that kind of math on your data, you need to use dvjs.

>[!hint]-
> if it is the last step and you can do the calculation inside the header, then you can use a hack shown here [[How dataview works#Inline code and Code Hacks]] 

#### string()
- docs:: [DQL function string](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#stringany)

the string(any) function is really useful in many cases when you don't know the datatype your field has. using string() around it forces it back into a plain string and you can use it to compare more easily. 

#### number()
- docs:: [DQL function number](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#numberstring)

the number() function takes a string and extracts the first number it finds, disregarding the rest of the string, even if there are more numbers. that means you have to split(string, separator) before using number() on it if you have multiple numbers you want to have. but with the right metadata setup you should never have that problem. if you do, it is often easier to change the setup for ease in the future.  

#### link()
- docs:: [DQL function link](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#linkpath-display)

link creates a wikilink out of a string. it is needed if you want to compare link values. 


#### embed()
- docs:: [DQL Function Embed](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#embedlink-embed)

it takes a link and embeds it. the problem is that embedding with dataview is buggy at best. it only works somewhat reliable with pictures and video. it CAN'T embed .md notes in any way. (sadly, but that will be fixed in Datacore)

#### contains()
- docs:: [DQL function contains](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#contains-and-friends)

contains and it's friends is one of the most important functions and is used really often in WHERE because you need it to write conditions on arrays.
for example 
\---
names:: ["Peter", "Hans"]
links: ["[[How dataview works]]", "[[How dataview works#Functions]]"]
\---
WHERE contains(names, "Hans") 
would return True in this case
but where names = "Hans"
would return false because names is an array and not a string

if you use
where contains(links, "how dataview works")
it will return false because you are comparing a link object with a string, so you need to do
where contains(links, link("how dataview works"))
for it to return true.

#### map()
- docs:: [DQL function map](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#maparray-func)
- docs:: [W3school JS Arrow function](https://www.w3schools.com/js/js_arrow_function.asp)

it works like the js map function but instead of being field.map(function) it is map(field, function). map() only works on arrays but if you want to use it on a single value you can just do map(array(field), function)
the way to write functions is done with arrow functions (lambdas in some languages)
for example 
```dataview
Table map(names, (t)=> link(t))
where file.path = this.file.path
```
this changes all values inside the names array field into a link. link(names) would do the same, but it is what is happening in the background.

```dataview
Table names, link(names, names+ " peter"), map(names, (t)=> link(t, t+ " peter"))
where file.path = this.file.path

```

#### filter()
- docs:: [DQL Function Filter](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#filterarray-predicate)

filter works like map() but does what the where would do, except that it is for value arrays and not the rows.

#### RegEx
- docs:: [Wikipedia RegEx](https://en.wikipedia.org/wiki/Regular_expression)
- docs:: [DQL Function RegEx](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#regextestpattern-string)

Regular Expressions or RegEx is a way to match strings more "easily". i won't explain it here but i want to say that there are great tools in the internet that help you create and check the RegEx expressions.

#### default()
- docs:: [DQL Function Default](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#defaultfield-value)

default gives nullish (null, undefined,...) fields a value. it is almost needed when you work with choice() or if you do math on your fields. the reason why you need it is because of the null - String or null - Number errors.


#### choice()
- docs:: [DQL Function Choice](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#choicebool-left-right)

The Choice function is basically the IF statement function of DQL. the only problem is that it has a bug that both directions have to be executable even if the condition wouldn't pick the way. it is especially notable when you do maths or date functions inside it. 
the way to make sure it works is by using the default function so that it still could do it.
choice(field, field - 3, "no value")
this would error out on field = null because of the null - Number error even if the conditon says that the "no value" way should be run and not the calculation. that means you need 
choice(field, default(field, 0) - 3, "no value")
to not get the error. the calculation is still not actually run/displayed

### Dates

#### date()
- docs:: [DQL Literals Dates](https://blacksmithgu.github.io/obsidian-dataview/reference/literals/#dates)
- docs:: [Metadata Types Date](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/#date)
- docs:: [Wikipedia Date ISO8601](https://en.wikipedia.org/wiki/ISO_8601)

Text that matches the ISO8601 notation will be automatically transformed into a date object. [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) follows the format `YYYY-MM[-DDTHH:mm:ss.nnn+ZZ]`. Everything after the month is optional.
Dataview follows the Luxon date "standard" and it only accepts this format inside the metadata.
The date() function only accepts that iso format.  

 The dateformat setting inside the Dataview Settings only influences how the date is shown inside the rendered results and NOT what the format inside the metadata has to be. it is ALWAYS the one above.

>[!note]- Exceptions
>you can use other dateformats if you really want/need to but then you are basically bound to dvjs queries because you can only use the actual luxon functions in dvjs like 
>dv.luxon.DateTime.fromFormat("10-03-2023", "dd-MM-yyyy"). 

#### dateformat()
- docs:: [Luxon Format Token](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)
- docs:: [moment.js Format Token](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/)

the dateformat() function let's you change the format of the date. NOTE: it outputs a STRING. that means you need to keep track of that. you can't compare a date to a string
it is a really useful function when working with dates.
for example it let's you add the day name of the date behind the date inside your weekly/monthly note.
```js dataview
link(rows.file.link, dateformat(rows.file.day,"yyyy-MM-dd - cccc"))
```
and to get all daily notes inside the monthly note dynamically
```js dataview
where dateformat(file.day,"yyyy-'M'MM")= this.file.name
```

#### duration
- docs:: [Metadata Types Duration](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/#duration)
- docs:: [DQL Literals Duration](https://blacksmithgu.github.io/obsidian-dataview/reference/literals/#durations)

dur() is mostly used in combination of date("today") to create a time frame till today. (last 7 days = date("today")-dur("7 d"))
the real work with duration calculation is done in dvjs

#### calculations

it is more a Note: 
Luxon is horrible in duration calculations (date1 - date2) longer or around 1 year and is most likely getting it wrong by a few days too weeks.
the reason for that is that luxon sees 1 month = 4 weeks = 31 days = 30 days = 28 days and depending on what it chooses, it will be more or less wrong. the only way around this is using dvjs and a custom calculation function

## DVJS
- docs:: [Basics and syntax of Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)

Dataviewjs is a really powerful way of writing your queries, but i would avoid using it if you don't know how to code JavaScript.
the reason why i'm saying that is because DQL is doing many things for you in the background that you have to do manually in dvjs and knowing the data structure and basics of JavaScript is required to get you anywhere in dvjs.

### console is your best friend

Obsidian is in the background just a web browser that works on local files. that means everything you see is styled by css and placed by html and js. 
it also means that you have full access to your new best friend. the developer console. you can open it with `ctrl + shift + i`
you have different tabs at the top. the "Console" tab is the one you need to see the output of the `console.log()` function.
the other tabs are fun to play in but you should read on what they do before you click on something that does unwanted stuff and breaks it.
the console is not available on phones, so writing dvjs code on phones is not just harder because of the typing but because you don't have access to the main debug tool.

The way i use the console is that i put console.log() behind every step until i have the data output i want to see before i continue writing the script.
that means that the last line i add to the code is actually the table output when i have the data in the format i need.
don't add code lines down the code too fast or you will waste time waiting for the error to appear or it getting stuck on way too big query outputs. 
if you have by accident 10k rows of results, the console will show that instantly, while the table render will take a few seconds while freezing obsidian.

### Structure

one important thing you need to know is what data the Query outputs need to render correctly.

#### DataArray vs JS Array
- docs:: [dvjs DataArray](https://blacksmithgu.github.io/obsidian-dataview/api/data-array/)

Dataview uses its own type of Array. the DataArray. it is quite important that you read the docs page about them.
for normal lists and tables it wouldn't really matter if you work with pure JS arrays or DataArrays but you need them for groupBy() because of how that function works.
all arrays you get from dvjs functions are DataArrays. if you want to change it into a normal JS array just put .array() behind it, but note that it could lose you information structure, like the group by.
if you want to convert a JS array to a DataArray you can use dv.array(js array)

there are also really useful functions that don't exist for JS arrays like:

```js dataviewjs
const DA = dv.array([2,5,5,7,7,9])
console.log(DA.first()) //returns 2
console.log(DA.last()) //returns 9
console.log(DA.distinct()) //returns dv.array([2,5,7,9])
```
and a few more that are explained as functions like [[How dataview works#DVJS#group by]]


#### Table
- docs:: [dvjs Table](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvtableheaders-elements)

the dv.table(header, data) function takes an array for the headers and a 2d array for the shown data.
each cell in the table is one index inside the 2d array.

```js dataviewjs
const page = dv.pages().sort(t=> t.file.mtime, "desc").limit(10)
//console.log(page) //it shows you an array with the file objects.
let headers = ["Link", "Name", "Mtime"]
let data = page.map(t=> [t.file.link, t.file.name, t.file.mtime])
//console.log(data) //it shows you the format you need at the end.
dv.table(headers, data)
```

#### Lists
- docs:: [dvjs Lists](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvlistelements)

you won't really need dv.lists because it is a more restained version of just using dv.span() or dv.paragraph()

```dataviewjs
const pages = dv.pages().limit(10).map(t=> t.file.link)
dv.list(pages)

```

#### TaskList 
- docs:: [dvjs TaskList](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvtasklisttasks-groupbyfile)

```js dataviewjs
const pages = dv.pages().where(t=> t.file.tasks).limit(10).file.tasks.where(t=> !t.completed)
dv.taskList(pages)
```

the dv.taskList() query takes an array of file.task objects. if you want to group them by someting else by the file link you need to use .groupBy

#### Text
- docs:: [dvjs Text](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#render)




#### Arrow Function
- docs:: [JS Arrow Function](https://www.w3schools.com/js/js_arrow_function.asp)

this docs page is really important that you read it because you need it in almost all dvjs functions that change your output.
it is really important that you understand this syntax before you can really start learning dvjs.

### Functions

#### dv.page
- docs:: [dvjs functions dv.page]()

dv.page(path) returns the file object of the path. it is mostly needed when you want to get the file object from a link. the reason for that is that dvjs doesn't do it automatically like DQL. that is why DQL has the meta(link) function.   

#### dv.pages
- docs:: [dvjs functions dv.page]()

dv.pages('"Folder" or \#tag') needs '  ' as the outer quotations and additional " " around folders but not around tags.
it always returns a dataArray with the file objects, even if the Array is 1 long. 

#### dv.current
- docs:: [dvjs functions dv.current](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvcurrent)

it returns the file obejct of the current file. it is the equivalent to "this" in DQL. 
Note: "this" in dvjs is pointing at "app" the root object of obsidian. 

#### where
- docs:: [JS Array Iteration functions](https://www.w3schools.com/js/js_array_iteration.asp)

where() is a synonym for .filter of JS arrays and works the same way. it only works on DataArrays 

#### map
- docs:: [JS Array Iteration functions](https://www.w3schools.com/js/js_array_iteration.asp)

map() works the same way as the one for JS arrays. it is needed inside dv.table queries to fill the cell values.

#### flat
- docs:: [JS Array Iteration functions](https://www.w3schools.com/js/js_array_iteration.asp)

flat() flattens a nested array into a one level array. the DataArray Flat flattens also JSON objects

#### group by




#### dv.tryQuery(DQL)
- docs:: [dvjs functions await dv.tryQuery](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvtryquerysource-file-settings)

await dv.tryQuery is a asynchronous function, so you need to use await before it.
it is a shortcut to get a table that you can do with DQL queries and you only want to change small details like adding a sum row at the bottom or so.


#### custom functions
- docs:: [JS Custom Functions](https://www.w3schools.com/js/js_functions.asp)

you don't really need to write your own functions in many queries but sometimes it is really useful to create a function to shorten the code and make the .map() cleaner.  

### Objects

#### Dates
- docs:: [DQL Literals Dates](https://blacksmithgu.github.io/obsidian-dataview/reference/literals/#dates)
- docs:: [Metadata Types Date](https://blacksmithgu.github.io/obsidian-dataview/annotation/types-of-metadata/#date)
- docs:: [Wikipedia Date ISO8601](https://en.wikipedia.org/wiki/ISO_8601)


##### Luxon
- docs:: [Luxon Docs ](https://moment.github.io/luxon/api-docs/index.html#datetime)
- docs:: [Luxon Docs Format Token](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)

Dataview uses Luxon and functions like dv.date() use it. if you want to get a date object from another dateformat you need to use:
dv.luxon.DateTime.fromFormat(String, Token)

##### moment.js
- docs:: [Moment.js Docs](https://momentjs.com/docs/#/use-it/)
- docs:: [Moment.js Docs Format Token](https://momentjs.com/docs/#/displaying/)

moment.js is another date library that works on the same iso format, but it has different tokens and the date object is build differently.
it is what most other obsidian plugins use. everytime you use the "YYYY-MM-DD" format with upper case letters, you are using moment.js.
it is one of the major confusion points for new poeple to dataview or templater.

##### better diff functions

The luxon date calculations are getting it wrong many times, especially for resulting durations of around a year. the reason for that is that it sees 1 month = 4 weeks = 28 days = 30 days = 31 days and for some reason it chooses the wrong ones when refactoring the units from the ms count. (i saw results 2-3 weeks off).
the custom function below isn't 100% accurate but by far more than the standard one. if you want to have different units as result you just have to edit what get's pushed into the array.

```js dataviewjs
 function newDiff(date1, date2) {
    let years = date1.diff(date2, 'year');
    date2.add(years, 'years');
    let months = date1.diff(date2, 'months');
    date2.add(months, 'months');
    let days = date1.diff(date2, 'days');
    date2.add(days, 'days');
    let hours = date1.diff(date2, 'hours');
    date2.add(hours, 'hours');
    let minutes = date1.diff(date2, 'minutes');
    date2.add(minutes, 'minutes');
    let seconds = date1.diff(date2, 'seconds');
    let resultArray = []
    if (years) resultArray.push(`${years} years`)
    if (months) resultArray.push(`${months} months`)
    if (days) resultArray.push(`${days} days`)
    if (hours) resultArray.push(`${hours} hours`)
    if (minutes) resultArray.push(`${minutes} minutes`)
    //if (seconds) resultArray.push(`${seconds} seconds`)
    const resultString = resultArray.join(', ')
    return  resultString;
};
```

## Inline code and Code Hacks

### Progress bars 

There are many ways of doing a Progress bar with dataview. here are some of them. [[Progress bar]]



### DQL Table with Working Tasks in a cell.

This is a way to get Tasks inside a table query. 
it is useful for MOC notes when you have tasks inside the notes about what you still need to do in it. i use it in combination to the progress bars.

```js dataview
table "`$= dv.taskList(dv.page(\"" + file.name + "\").file.tasks.where(t=> !t.completed), false)`" AS TASKS
From "Discord Support/Dataview Data"
where file.tasks
```

## Dataviewjs inside Templater

you can use dataviewjs inside templater to print out Lists and Tables in markdown format
<%*
const dv = app.plugins.plugins["dataview"].api
-%>
this code line gives you access to the dv element. then it works as normal. if you want to print out the markdown format you need to use dv.markdownTable(headers, data) or markdownList(data) 

an use case for that would be when you want to finalise your query results, so that they are readable on Publish webpages.
another usecase is to have a more complex templater script that changes based on the metadata inside the note you are using the template on.


## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```



