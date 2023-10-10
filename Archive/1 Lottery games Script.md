<%*

function choose(n, r) {
  return [...new Array(n)].map((_0, idx) => idx +1).shuffle().slice(0, r)
}

function drawing(picks, round) {
    let matches = 0;
    let results = choose(49, 6);
    for(let i = 0; i< 6; i++ ){
        for(let j = 0; j< 6; j++ ){
            if(results[i] === picks[j]){
                matches++;
            }
        }
    }
    //console.log({"round": round, "results": results, "picks": picks, "matches": matches })
    return {"round": round, "results": results, "picks": picks, "matches": matches }
}
console.groupCollapsed("test")
console.time("gameResults")
function main(){
    //let picks = [1,2,3,4,5,6]
    for(let i = 1; i<= 200000; i++ ){
        let picks = choose(49, 6)
        let gameResult = drawing(picks,i)
        output = JSON.stringify(gameResult) + ","
-%>
    <%output%>
<%*
    }
    console.timeLog("gameResults")
}
console.log("new game")
main()
console.timeEnd("gameResults")
console.groupEnd("test")
-%>
