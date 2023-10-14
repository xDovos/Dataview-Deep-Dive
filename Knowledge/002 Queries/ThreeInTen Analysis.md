---
aliases: []
Type: 
MOC:
---

status::  `$= const setPage = "ThreeInTen Analysis"; const setFilter = "Status Tasks" ; const value = Math.round(((dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) / (dv.page(setPage).file.tasks).where(t => String(t.section).includes(setFilter)).length) * 100); "<progress value='" + value + "' max='100'></progress>" + "<span style='font-size:smaller;color:var(--text-muted)'>" + value + "% &nbsp;| &nbsp;" + (dv.page(setPage).file.tasks.where(t => String(t.section).includes(setFilter)).length - dv.page(setPage).file.tasks.where(t => t.completed).where(t => String(t.section).includes(setFilter)).length) + " left</span>" `

###### Status Tasks
- [x] create the note ✅ 2023-08-08
- [ ] write the Intro
- [ ] Write the YAML metadata
- [ ] Write the query


# ThreeInTen Analysis

## Intro 

This note is about a simple gambling game. the game is choose 3 in 10 and works like the lottery 6 in 49
it works by picking 3 numbers between 1 and 10 and then 3 numbers get drawn. you win when all 3 are matching.
the goal of this note is to show the chances you have to win this game based on data collected from 500 games.
you can find the data in [[ThreeInTen Data]]. but be warned that the note might lag you out when it is open.
In this sample both the draws and the numbers we choose are randomly picked each round.


## Raw Data Table

This query shows the Raw data from all 500 games and thus is pretty long when rendered out.
From the Raw data we can count that we only have 7 wins in all 500 rounds.

```js 
TABLE without id Runs.round, join(Runs.drawn, ", "), join(Runs.picked, ", "), Runs.hits
FROM "Raw Data/ThreeInTen Data"
FLATTEN ThreeInTen as Runs
SORT Runs.hits desc, Runs.round asc
```

>[!info]- Rendered
>```dataview
>TABLE without id Runs.round, join(Runs.drawn, ", "), join(Runs.picked, ", "), Runs.hits
>FROM "Raw Data/ThreeInTen Data"
>FLATTEN ThreeInTen as Runs
>SORT Runs.hits desc, Runs.round asc
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FROM]], [[FLATTEN]], [[SORT]], [[WITHOUT ID]]
    - functions:: [[join]]
    - tags:: 
    - image:: 

## amount of appearances of the numbers

this query shows how often each of the numbers got drawn in all 500 games.
as you can see it is pretty evenly spread out. this suggests that it doesn't really matter which 3 numbers you choose.

```js 
TABLE length(rows.Runs)
FROM "Raw Data/ThreeInTen Data"
FLATTEN ThreeInTen as Runs
FLATTEN Runs.drawn as RD
GROUP BY RD as Number
```

>[!info]- Rendered
>```dataview
>TABLE length(rows.Runs)
>FROM "Raw Data/ThreeInTen Data"
>FLATTEN ThreeInTen as Runs
>FLATTEN Runs.drawn as RD
>GROUP BY RD as Number
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FROM]], [[FLATTEN]], [[GROUP BY]]
    - functions:: [[length]]
    - tags:: 
    - image:: [[ThreeInTen_Analysis_Appearances_of_numbers.png]]


## Drawings of the same numbers 

this query shows how often a 3 number combination got drawn in the set of data.
I'm surprised that there is such a big difference.

```js dataview
TABLE length(rows.Runs)
FROM "Raw Data/ThreeInTen Data"
FLATTEN ThreeInTen as Runs
GROUP BY Runs.drawn as Drawn
SORT length(rows.Runs) desc
```

>[!info]- Rendered
>```dataview
>TABLE length(rows.Runs)
>FROM "Raw Data/ThreeInTen Data"
>FLATTEN ThreeInTen as Runs
>GROUP BY Runs.drawn as Drawn
>SORT length(rows.Runs) desc
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]], [[FROM]], [[FLATTEN]], [[GROUP BY]], [[SORT]]
    - functions:: [[length]]
    - tags:: 
    - image:: 

## Probability Analysis

```dataviewjs

function calculateHitProbabilities(data) {
  let hitCounts = {};
  data.ThreeInTen.forEach(item => {
    if (item.hits in hitCounts) {
      hitCounts[item.hits]++;
    } else {
      hitCounts[item.hits] = 1;
    }
  });
  
  let totalRounds = data.ThreeInTen.length;
  let probabilities = {};
  for (let hits in hitCounts) {
    probabilities[hits] = parseFloat(Number((hitCounts[hits] / totalRounds) * 100).toFixed(2));
  }
  return probabilities;
}

let page = dv.page("Raw Data/ThreeInTen Data")
let probabilities = calculateHitProbabilities(page);
console.log(probabilities)
let data = dv.array(probabilities).map(t=> [ "Probability",t[0], t[1], t[2], t[3]])
dv.table(["matches", "0", "1", "2", "3"], data)

```

>[!info]- Rendered
>```dataviewjs
>
>```


- Query meta
    - QueryType:: [[DVJS]]
    - DVfunctions:: 
    - JSfunctions:: 
    - tags:: 
    - image:: 

## Probability Analysis DQL

```dataview
TABLE pobability
FROM "Raw Data/ThreeInTen Data"
FLATTEN [length(threeinten)] as TotalRounds
FLATTEN threeinten as TIT
group by TIT.hits as Hits 
FLATTEN [round((length(rows.round) / rows.TotalRounds[0])*100, 2)] as pobability
```

>[!info]- Rendered
>```dataview
>
>```

- Query meta
    - QueryType:: [[DQL]]
    - dataCommands:: [[TABLE]],
    - functions:: 
    - tags:: 
    - image:: 




## Appearances

```dataview
Table without id file.inlinks as Inlinks, 
map(file.outlinks, (t)=> choice(meta(t).subpath, 
"[["+ link(meta(t).path).file.name+"#"+ meta(t).subpath +"]]", 
link(meta(t).path))) as Outlinks
where file.path = this.file.path
```









