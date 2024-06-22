---
Type: Dataview
QueryType: DQL
tags:
  - DV/DQL
  - DV/Query
self: "[[DV DQL basic Syntax#DV DQL basic Syntax]]"
---

## DV DQL basic Syntax

```js dataview
TASK/ LIST field1 /TABLE field1, field2, fieldn 
FROM //Source ""/#
WHERE //if condition
FLATTEN field AS F//Array manipulation
WHERE // if condition the flattened array
GROUP BY //Grouping 
SORT //Sorting
```
### Explanation

- TASK: creates a query that returns the tasks inside the files.
- LIST: lists the result with max one additional field 
- TABLE: creates a table with fields as headers that create columns
- FROM: set's the source of the files it searches through. FROM "Folder" makes it only search through the files in the folder "Folder" and ignores the rest of the vault. (Good for performance in large Vaults)
- WHERE: like a IF condition that filters the rows for rows that return true to the condition and removes all rows that return false.
- FLATTEN: Flattens an array by creating a row for each entry. CAUTION: it is a magic method and is confusing most of the time.
- GROUP BY: Groups the rows by a field. Headers have to be changed by adding a rows. before the header.


