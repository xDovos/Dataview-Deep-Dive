---
aliases: 
Type: Datacore
MOC:
---

status:: `$=return(await self.require.import("Code Modules/modulePB.js.md")).PBSingleNoteHeader(dv, "first datacore testing", "Status Tasks")`

###### Status Tasks
- [ ] Create the Note
- [ ] Write the YAML metadata
- [ ] Write the Note

# first datacore testing

```yaml:data
test: 1
name: "Dovos"
when: 2023-05-21
file: "[[@Dovos]]"
```


## test 2

```datacorejsxn
const COLUMNS = [
    { id: "Link", value: (game) => game }
    //{ id: "codeblock", value: (game) => game},
    //{ id: "Name", value: (game) => game.$blocks[0]},
    //{ id: "When", value: (game) => game.$blocks[0].value("when") },
    //{ id: "Test", value: (game) => game.$blocks[0].value("test") },
    //{ id: "File", value: (game) => game.$blocks[0].value("file") }
];

return function View() {
    // Fetch from all path that contains @datablock
    const games = dc.useQuery(`(@section and parentof(@datablock and exists(file))) or (@datablock and exists(file))`)
    const grouped = dc.useArray(games, array => {
        // Sort based on a.test
        console.log(array)
        return array
            .sort(x => x.test, 'desc');
    });
    //console.log(games)
    return (
        <>
       <dc.VanillaTable columns={COLUMNS} rows={grouped}/>
        </>
    );
}
```

```yaml:data
test: 2
name: "Daniel"
when: 2000-05-21
file: "[[@Daniel @NL]]"
```
#game

## query

```datacorejsxb
const COLUMNS = [
    { id: "Link", value: (game) => game },
    { id: "datablock", value: (game) => game.value("$data")}
    //{ id: "Name", value: (game) => game.$blocks[0]},
    //{ id: "When", value: (game) => game.$blocks[0].value("when") },
    //{ id: "Test", value: (game) => game.$blocks[0].value("test") },
    //{ id: "File", value: (game) => game.$blocks[0].value("file") }
];

return function View() {
    // Fetch from all path that contains @datablock
    const games = dc.useQuery(`(@section and parentof(@datablock and exists(file))) or (@datablock and exists(file))`)
    const grouped = dc.useArray(games, array => {
        // Sort based on a.test
        console.log(array)
        return array
            .sort(x => x.test, 'desc');
    });
    //console.log(games)
    return (
        <>
       <dc.VanillaTable columns={COLUMNS} rows={grouped}/>
        </>
    );
}
```


```datacorejsxs
const COLUMNS = [
    { id: "File", value: (file) => file.$link},
    { id: "Name", value: (file) => file.$name},
    { id: "blocks", value: (file) => file.$sections[1].$blocks[0].value("file") },
    { id: "inlineData", value: (file) => file.$sections.filter(s => s.$blocks.filter(b => b.$data)).map(s => s.$blocks.map(b => b.value("file")))},
    { id: "inlineFields", value: (file) => file.value("status") },
    { id: "Rating", value: (file) => file.value("rating") }
];
function test(file){
    let test = file.$sections[1].$blocks[0].$links
    console.log(test)
}

return function View() {
    const qdata = dc.useQuery("$sections and #game and @page");
    //console.log(qdata)
    test(qdata[0])
    return (
        <dc.VanillaTable columns={COLUMNS} rows={qdata}/>
    );
}

```


```datacorejsxs
const COLUMNS = [
    { id: "Game", value: (game) => game.$link },
    { id: "Time Played", value: (game) => game.value("time played") ?? game.value("time-played") },
    { id: "Length", value: (game) => game.value("length") },
    { id: "Tags", value: (game) => game.$tags.filter(t => t.startsWith("#game/")).join(" ") },
    { id: "Rating", value: (game) => game.value("rating") }
];

function timePlayed(input) {
    let raw = input.value("time played") ?? input.value("time-played");
    while (Array.isArray(raw)) raw = raw[0];

    if (typeof raw === "string") return undefined;
    return raw;
}

return function View() {
    const games = dc.useQuery("#game and @page");
    console.log(games)
    const grouped = dc.useArray(games, array => {
        return array
            .sort(x => timePlayed(x), 'desc')
            .groupBy(x => timePlayed(x)?.year)
            .sort(x => x.key, 'desc');
    });

    console.log(grouped);

    return (
        <dc.VanillaTable columns={COLUMNS} rows={grouped}/>
    );
}
```

```datacorejsx
return function View() {
    const current = dc.useCurrentFile();
    const incoming = dc.useQuery(`@page and linksto(id("${current.$path}"))`).filter(entry => entry.$link);
    const outgoing = current.value("$links");
    console.log(outgoing)
    return (
        <table className="datacore-table">
            <tr>
                <td><b>Inlinks</b></td>
                <td>
                    {incoming.map(entry => (
                        <span style="margin: 4px; padding: 4px; background-color: var(--interactive-before);">
                            <dc.Link link={entry.$link}/>
                        </span>
                    ))}
                </td>
            </tr>
            <tr>
                <td><b>Outlinks</b></td>
                <td>
                    {outgoing.map(entry => (
                        <span style="margin: 4px; padding: 4px; background-color: var(--interactive-before);">
                            <dc.Link link={entry.path}/>
                        </span>
                    ))}
                </td>
            </tr>
        </table>
    );
}
```


[[Progress bar]]
[[DVJS with custom Functions]]


```datacorejsx
// Config header and also query string here.
// Support sort and also filter box.
const query = `@page and #game `;
const columns_array = [
    { title: "Link", value: "$link" },
    { title: "Name", value: "name" },
    { title: "When", value: "when" },
    { title: "Test", value: "test" },
    { title: "File", value: "file" }
];

function View() {
    const games = dc.useQuery(query);
    const [sortConfig, setSortConfig] = dc.useState({ key: null, direction: 'asc' });
    const [filter, setFilter] = dc.useState("");

    const columns = columns_array.map((c) => {
        return c.value.startsWith('$') ? {
            title: () => <span onClick={() => handleSort(c.value, true)}>{c.title}{getSortIndicator(c.value)}</span>,
            value: (game) => game[c.value]
        } : { title: () => <span onClick={() => handleSort(c.value, false)}>{c.title}{getSortIndicator(c.value)}</span>, value: (game) => game.value(c.value) };
    });

    const filteredAndSortedGames = dc.useMemo(() => {
        let filtered = games;

        if (filter) {
            filtered = games.filter((game) => {
                return Object.keys(game.$frontmatter).some((key) => {
                    return key.includes(filter) || game.$frontmatter[key].raw.toString().includes(filter);
                }) || game.$file.includes(filter);
            });
        }

        if (sortConfig.key) {
            filtered = filtered.sort((a, b) => {
                const aValue = sortConfig.key.startsWith('$') ? a[sortConfig.key] : a[sortConfig.key].toString();
                const bValue = sortConfig.key.startsWith('$') ? b[sortConfig.key] : b[sortConfig.key].toString();
                return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });
        }
        console.log(filtered);

        return filtered;
    }, [games, filter, sortConfig]);

    const handleSearch = (inputEvent) => {
        setFilter(inputEvent.target.value);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    return (
        <>
            <dc.Group justify="end">
                <input onChange={handleSearch} />
            </dc.Group>
            <dc.VanillaTable columns={columns} rows={filteredAndSortedGames} />
        </>
    );
}

return <View />;

```







## Appearances

```dataviewjs
const inlinks = dv.current().file.inlinks
const outlinks = dv.current().file.outlinks.mutate(t=> t.embed = false)
const indexA = Array.from({ length: Math.max(inlinks.length, outlinks.length) }, (_, index) => index)
const data = indexA.map((i)=> [inlinks[i] || " ", outlinks[i] || " "])
const style = "<span style='font-size:smaller;color:var(--text-muted)'>("
dv.table(["inlinks "+ style + inlinks.length +")", "outlinks "+ style + outlinks.length +")"], data)
this.container.querySelectorAll(".table-view-table tr:first-of-type th:first-of-type > span.small-text")[0].style.visibility = "hidden";
```

