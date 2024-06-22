---
Type: Dataview
QueryType: DQL
tags: [DV/DQL, DV/Query]
self: ["[[DV DVJS prev and next file in the folder#DV DVJS prev and next file in the folder]]", "[[DV DVJS prev and next file in the folder#DV DVJS prev and next file in the folder with functions]]"]
---
Docs::

## DV DVJS prev and next file in the folder

```js dataviewjs
let currentFilePath = dv.current().file.path
let nextIndex = 0
let prevIndex = 0


let currentSubPagesSorted = dv.pages(`"${dv.current().file.folder}"`).sort(b => b.file.name, 'asc').values
for (let i = 0; i < currentSubPagesSorted.length; i++) {
    let filePath = currentSubPagesSorted[i].file.path
    if (i == currentSubPagesSorted.length -1  ){
	    prevIndex = i - 1
	    nextIndex = 0
	    break
    }
    if (i==0 && filePath == currentFilePath) {
	    prevIndex = currentSubPagesSorted.length -1
	    nextIndex = 1
	    break
    }
    if (filePath == currentFilePath) {
        prevIndex = i - 1
        nextIndex = i + 1
        break
        }
    }

let prevPage = dv.pages(`"${dv.current().file.folder}"`).sort(b => b.file.name, 'asc').values[prevIndex]
let nextPage = dv.pages(`"${dv.current().file.folder}"`).sort(b => b.file.name, 'asc').values[nextIndex]
dv.span(dv.fileLink(prevPage.file.link.path, false, "<< "+ prevPage.file.name)+ " " +dv.fileLink(nextPage.file.link.path, false, nextPage.file.name+ " >>"))
```

### Explanation

- 


## DV DVJS prev and next file in the folder with functions

```js dataviewjs
let currentFilePath = dv.current().file.path
let currentSubPagesSorted = dv.pages(`"${dv.current().file.folder}"`).sort(b => b.file.name, 'asc').values

function getIndex(options) {
    let direction = options.direction
    let targetIndex = 0
    for (let i = 0; i < currentSubPagesSorted.length; i++) {
        let filePath = currentSubPagesSorted[i].file.path
        if (filePath == currentFilePath) {
            if (direction == 'forward') {
                targetIndex = i + 1
                break
            } else if (direction == 'backwards') {
                targetIndex = i - 1
            }
        }
    }
    return targetIndex
}

function getPrevFileLink(options) {
    let prevIndex = options.prevIndex
    if (prevIndex == -1) {
        prevIndex = currentSubPagesSorted.length - 1
    }
    let prevPage = currentSubPagesSorted[prevIndex]
    let prevPageFileLink = dv.fileLink(prevPage.file.link.path, false, "<< " +  prevPage.file.name)
    return prevPageFileLink
}

function getNextFileLink(options) {
    let nextIndex = options.nextIndex
    if (nextIndex == currentSubPagesSorted.length) {
        nextIndex = 0
    }
    let nextPage = currentSubPagesSorted[nextIndex]
    let nextPageFileLink = dv.fileLink(nextPage.file.link.path, false, nextPage.file.name + " >>")
    return nextPageFileLink 

}
// prevIndex
let prevIndex = getIndex({'direction': 'backwards'})
let prevFileLink = getPrevFileLink({'prevIndex': prevIndex})
// nextIndex
let nextIndex = getIndex({'direction': 'forward'})
let nextFileLink = getNextFileLink({'nextIndex': nextIndex})
dv.span(prevFileLink + ' | ' + nextFileLink)
```

### Explanation 

- 

