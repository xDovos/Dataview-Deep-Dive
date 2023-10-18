<%*
const dv = app.plugins.plugins["dataview"].api
const NID = []
const pages = dv.pages().where(t => dv.func.contains(NID, t.metA.NID))
console.log(pages)
-%>

<%*
pages.forEach((page)=>{
    tp.file.create_new(await dv.io.load(page.file.path), page.file.name, false, app.vault.getAbstractFileByPath(page.file.folder +"/"+ page.file.name + "new"))
})

-%>
