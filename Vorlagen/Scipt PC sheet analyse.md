<%*
const dv = app.plugins.plugins["dataview"].api
const page = dv.page(tp.file.title)
//console.log(page)
-%>
<%*
const content = `---
player_name: ${page.player_name}
name: ${page.name}
gender: ${page.gender}
race: ${page.file.lists.where(t=> t.race && t.checked).race.join()}
age: ${page.age}
birthday: ${page.birthday.toFormat("yyyy-MM-dd")}
class: ${page.file.lists.where(t=> t.pc_class && t.checked).pc_class.join()}
profession: ${page.file.lists.where(t=> t.profession && t.checked).profession.join()}
eyes: ${page.eyes}
hair: ${page.hair}
height: ${page.height}
weight: ${page.weight}
skin: ${page.skin}
alignment: ${page.file.lists.where(t=> t.alignment && t.checked).alignment.join()}
str: ${page.str}
dex: ${page.dex}
con: ${page.con}
int: ${page.int}
wis: ${page.wis}
cha: ${page.cha}
---


`
//console.log(content)
-%>
<%*
tp.file.create_new(content, "PC " + page.player_name + " - "+ page.name, true, app.vault.getAbstractFileByPath("PC") ) 
-%>

