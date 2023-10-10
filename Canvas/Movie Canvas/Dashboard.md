---
cssclasses:
  - cards
---

# To be Watched

```dataview
TABLE ("![|100](" + image + ")") as "Cover", 
personalRating as "Rating"
FROM "Movies"
WHERE (!Status or !Priority) and !watched
```












