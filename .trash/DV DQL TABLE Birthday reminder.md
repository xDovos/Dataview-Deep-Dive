---
Type: Dataview
QueryType: DQL
tags: [DV/DVJS, DV/Query]
self: "[[DV DQL TABLE Birthday reminder#DV DQL TABLE Birthday reminder]]"
---


## DV DQL TABLE Birthday reminder

```dataview
TABLE DOB, WillBe, On
FROM "Discord Support/Dataview Data"
WHERE DOB and !DOD
FLATTEN date(today).year - DOB.year AS ThisYearAge
FLATTEN DOB + dur(string(ThisYearAge) + " years") AS ThisBDay
FLATTEN choice(ThisBDay > date(today), ThisYearAge, ThisYearAge+1) AS WillBe
FLATTEN choice(ThisBDay > date(today), ThisBDay, ThisBDay + dur("1 year")) AS On
SORT NextBDay
```


### Explanation
- Requirements:
	- DOB (DateOfBirth)
	- !DOD (DateOfDeath)

- Optional:
	- WHERE On < date(today) + dur("90 days")
	- Limits the dates to the next 90 Days


