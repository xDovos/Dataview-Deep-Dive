
status::  `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "Untitled 1", "Status Tasks")`




testing 
sutff
testing



```dataview
Table without Id nr, key[nr - 1], values[nr - 1],nr3
Where file.path =this.file.path 
FLATTEN [list((end)=> "`$=return(await self.require.import('Code Modules/moduleUtils.js.md')).UtilsArray(\""+end+"\")`")] as nr2
Flatten [list("name:","age:","lol:")] as key
Flatten [list("peter","29","hi")] As values
Flatten [nr2[0](3)] as nr3
Flatten list(1,2,3) as nr
```



```dataviewjs
let current = dv.current()
//console.log("start:"+ dv.date("now").toFormat("mm:ss"))
let data = await this.app.vault.readJson("Raw Data/results.json")

function calculateHitProbabilities() {
  let hitCounts = {};
  data.forEach(item => {
    if (item.hits in hitCounts) {
      hitCounts[item.hits]++;
    } else {
      hitCounts[item.hits] = 1;
    }
  });
  
  let totalRounds = data.length;
  let probabilities = {};
  for (let hits in hitCounts) {
    probabilities[hits] = parseFloat(Number((hitCounts[hits] / totalRounds) * 100).toFixed(2));
  }
  return probabilities;
}


let probabilities = calculateHitProbabilities();
//console.log(probabilities)
let tdata = dv.array(probabilities).map(t=> [ "Probability",t[0], t[1], t[2], t[3]])

function numCounts(numbers){
    const counts = {};
    numbers.forEach(number => {
        counts[number] = (counts[number] || 0) + 1;
    });
    return counts;
}
let countDrawn = numCounts(data.flatMap(entry => entry.drawn))
let countPicked = numCounts(data.flatMap(entry => entry.picked))
let tdata2 = []
tdata2.push(dv.array(countDrawn).flatMap(t=> ["Drawn", t["1"], t["2"], t["3"], t["4"], t["5"], t["6"], t["7"], t["8"], t["9"], t["10"]]))
tdata2.push(dv.array(countPicked).flatMap(t=> ["Picked", t["1"], t["2"], t["3"], t["4"], t["5"], t["6"], t["7"], t["8"], t["9"], t["10"]]))
tdata2.push(["Diff", tdata2[0][1]-tdata2[1][1], tdata2[0][2]-tdata2[1][2], tdata2[0][3]-tdata2[1][3], tdata2[0][4]-tdata2[1][4], tdata2[0][5]-tdata2[1][5], tdata2[0][6]-tdata2[1][6], tdata2[0][7]-tdata2[1][7], tdata2[0][8]-tdata2[1][8], tdata2[0][9]-tdata2[1][9], tdata2[0][10]-tdata2[1][10]])

dv.header(2, "probability")
dv.table(["matches", "0", "1", "2", "3"], tdata)
dv.header(2, "apearance of numbers")
dv.table(["Name", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],tdata2)
dv.header(2, "Wins")
dv.table(["round", "picked", "Drawn"], dv.array(data.filter(t=> t.hits === 3).map(t=> [t.round, t.picked.join(", "), t.drawn.join(", ")])).limit(100))
```




hello



