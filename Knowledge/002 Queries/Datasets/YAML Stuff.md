#Works/Video/TV
Statu:: test
ComplateStatu:: stuff


```dataviewjs
function status(Statu, ComplateStatu){
    if(!Statu){return "-"}
    console.log(dv.func.typeof(Statu))
    if(dv.func.typeof(Statu) === "string"){
        return Statu +"-"+ ComplateStatu
    }
    let value = []
    for(let i = 0; i < dv.array(Statu).length; i++){
        console.log(i)
        value.push(Statu[i] +"-"+ ComplateStatu[i])
    }
    return dv.func.flat(value)
}
function spread(Statu, ComplateStatu){
    let value = status(Statu, ComplateStatu)
    if(value)
}

const pages = dv.pages("#Works/Video/TV").where(p => !dv.func.contains(p.file.name,"Perm") && !dv.func.contains(p.file.name,"+")).sort(p=> p.StartTime, "desc")
const data = pages.map(p=> [p.Cover, p.Rating, p.file.link, p.Director, p.Genre, p.StartTime, status(p.Statu, p.ComplateStatu)])
dv.table(false, data)
```

