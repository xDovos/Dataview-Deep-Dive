


`$= const value = Math.round(((dv.page("Example Project").file.tasks.where(t => t.completed).length) / (dv.page("Example Project").file.tasks).length) * 100); const left = dv.page("Example Project").file.tasks.length ; "<progress value='" + value + "' max='100'></progress>" + " " + value + "%" + " " + left + " Left"; `


- [ ] test
- [x] hi ✅ 2023-01-26
- [ ] you


