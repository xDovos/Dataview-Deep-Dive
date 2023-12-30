<%*

// Get contents of file you want to edit
const currentTFile = tp.file.find_tfile(tp.file.path(true));
let { headings } = app.metadataCache.getFileCache(currentTFile);
headings = headings.filter(t=> t.heading != "Explanation" && t.heading != "Appearances")
const content = await app.vault.read(currentTFile);
// Split content into lines
const lines = content.split("\n");
// Append content to end of specific line
let lineNumber = headings[1].position.start.line
// go back all empty lines
if (lines[lineNumber - 1] != ""){
    lines[lineNumber-1] += "\n";
    lineNumber--;
}
while(lines[lineNumber - 1] == "" && lineNumber >0){
    lineNumber -= 1;
}
lines[lineNumber] += "- [ ] Queries\n" 
for (let i = 2; i < headings.length; i++){
    lines[lineNumber] += `    - [ ] ${headings[i].heading}
        - [ ] Write the Query
        - [ ] Write the Query Metadata
`;
}

// Join lines back together
const newContent = lines.join("\n");
// Update file you want to edit
await app.vault.modify(currentTFile, newContent);
_%>