---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: ["[[DV DQL sum#DV DQL TABLE Sum with FLATTEN calculation]]", "[[DV DQL sum#DV DQL TABLE Sum win lose rate with choice]]"]
Field1: 40
Field2: 30
Field3: 1.5
---
Docs:: [DQL Sum](https://blacksmithgu.github.io/obsidian-dataview/reference/functions/#sumarray)


## DV DQL TABLE Sum with FLATTEN calculation

```dataview
TABLE without id rows.file.link, rows.distance, rows.completed, rows.L, sum(rows.L)
FROM "Discord Support/Dataview Data/Daily notes"
WHERE distance and completed
FLATTEN completed*distance*2 as L
GROUP BY ""
```



### Explanation 

- The Query returns one row with all the values of the daily notes. in the last column the results of the flatten get summed up into one value.
- the group by "" is grouping each row into one row by grouping by a null value. it has no result as ID and thus we remove that column.
- if you group by another value like the week number, then it sums it up per week.

## DV DQL TABLE Sum win lose rate with choice

### grouped by player character
```dataview
TABLE length(rows.file.link) AS "Times played", rows.outcome, sum(rows.wins) ,  sum(rows.wins) / sum(rows.wins + rows.loses) * 100 AS "Winrate%"
FROM "Discord Support/Dataview Data" 
where eyes
flatten choice(outcome = "win", 1, 0) as "wins"
flatten choice(outcome = "lose", 1, 0) as "loses"
GROUP BY eyes as "Played Characters"
```

### grouped by matchup player character vs enemy character

```dataview
TABLE 
length(rows.file.link) as "Times played",
sum(rows.wins) AS "Wins",
sum(rows.losses) AS "Losses",
sum(rows.wins) / sum(rows.wins + rows.losses) * 100 AS "Winrate%"
FROM "MD-Notes/Melee/Match Reviews"
FLATTEN choice(outcome = "Won", 1, 0) as "wins" 
FLATTEN choice(outcome = "Loss", 1, 0) as "losses"
flatten player_char + " vs " + opponent_char as "matchup" 
GROUP BY matchup
```


```dataview
Table field1 + field2 + field3
Where file.path =this.file.path 

```

