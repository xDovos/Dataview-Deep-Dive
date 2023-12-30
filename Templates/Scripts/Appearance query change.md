<%*
async function changeFile(name){
// Get contents of file you want to edit
    const currentTFile = tp.file.find_tfile(name);
    let { headings } = app.metadataCache.getFileCache(currentTFile);
    if(!headings){return }
    headings = headings.filter(t=> t.heading == "Appearances")
    if(headings.length == 0){return }
    const content = await app.vault.read(currentTFile);
    // Split content into lines
    let lines = content.split("\n");
    // Append content to end of specific line
    let lineNumber = headings[0].position.start.line
    lines = lines.slice(0, lineNumber+1)
    lines[lineNumber] += `

\`\`\`dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
\`\`\`

`

    // Join lines back together
    const newContent = lines.join("\n");
    // Update file you want to edit
    await app.vault.modify(currentTFile, newContent);
}

const dv = DataviewAPI;
for (let note of dv.pages()){
    await changeFile(note.file.path)
}
console.log("Finished")
_%>