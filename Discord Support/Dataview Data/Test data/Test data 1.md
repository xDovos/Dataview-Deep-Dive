---
aliases:
  - Test note 1
Type: Dataview_Data
eyes: yellow
outcome: win
employer: BC
start:
  - 2023-01-13
  - 2023-01-16
  - 2023-01-21
end:
  - 2023-01-14
  - 2023-01-20
  - 2023-01-25
  - 2023-12-3
Nivel: 8
front: hi
group: 1
meta:
  - Q: col1
    A:
      - 1
      - 2
      - 3
  - Q: col2
    A:
      - 1
      - 2
      - 3
      - 4
---

[[Test data 2]]

[[Test data 3]]

[[Test data 4]]


- [ ] task 1
- [ ] task 2

```dataview
TABLE reverse(sort(file.outlinks, (t)=> t.file.mday)).file.mday[0]
FROM "Discord Support/Dataview Data"
SORT reverse(sort(file.outlinks, (t)=> t.file.mday)).file.mday[0] desc


```


```dataviewjs
// Sample markdown content
const markdownContent = `
[Parent File 1](path/to/parent1.md)
  [Child File 1](path/to/child1.md)
  [Child File 2](path/to/child2.md)
    [Grandchild File 1](path/to/grandchild1.md)
[Parent File 2](path/to/parent2.md)
`;

// Function to create the file tree
function createFileTree(markdownContent) {
  const lines = markdownContent.split('\n');
  const fileTree = [];

  function parseLine(line) {
    const level = line.search(/\S/);
    const linkMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/);

    if (linkMatches) {
      const [, name, path] = linkMatches;
      return { name, path, level };
    }

    return null;
  }

  lines.forEach((line) => {
    const file = parseLine(line);
    if (file) {
      const parentLevel = file.level - 2;

      if (parentLevel >= 0) {
        const parentFiles = fileTree[parentLevel];
        if (parentFiles) {
          parentFiles.children.push(file);
        }
      } else {
        fileTree.push({ ...file, children: [] });
      }
    }
  });

  return fileTree;
}

// Usage
const fileTree = createFileTree(markdownContent);
console.log(fileTree);
```
