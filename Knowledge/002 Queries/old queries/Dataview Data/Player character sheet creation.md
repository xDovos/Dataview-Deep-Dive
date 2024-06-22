---
Type: Temp

---

# Character sheet creation






## Base info

- Player_Name:: Hans Peter
- name:: Gregor
- gender:: Male
- age:: 25
- birthday:: 1980-03-04


## Stats

- str:: 5
- dex:: 6
- con:: 6
- int:: 8
- wis:: 9
- cha:: 4

## Appearance 

- eyes:: red
- hair:: long, brown
- height:: 1.90
- weight:: 100
- skin:: white


## Note
Change to Reading view with Ctrl + E to fill out the remaining points
## Alignment 

- [ ] (alignment:: Good) (desc:: " : A tendency to be a good person")
- [ ] (alignment:: Neutral) (desc:: " : A tendency to be a Neutral person")
- [ ] (alignment:: evil) (desc:: " : A tendency to be a evil person")
- [x] (alignment:: chaotic) (desc:: " : A tendensy to be a chaos person") ✅ 2023-01-05


## Class

- [ ] (pc_class:: "Rogue") (desc:: " : A class description for the rogue")
- [ ] (pc_class:: "Knight") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Archer") (desc:: " : A class description for the ")
- [x] (pc_class:: "Assassin") (desc:: " : A class description for the ") ✅ 2023-01-05
- [ ] (pc_class:: "Mage-Apprentice") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Archmage") (desc:: " : A class description for the ")
- [x] (pc_class:: "King") (desc:: " : A class description for the ") ✅ 2023-01-05
- [ ] (pc_class:: "Peasant") (desc:: " : A class description for the ")


## Race

- [x] (race:: "Human") (desc:: " : a human") ✅ 2023-01-05
- [ ] (race:: "Elf") (desc:: " : a Elf")
- [ ] (race:: "dwarf") (desc:: " : a Dwarf")

## Profession 

- [ ] (profession:: "Blacksmith")
- [x] (profession:: "Enchanter") ✅ 2023-01-05



# Overview Character

```dataview
Table rows.L.text
where file.path = this.file.path
flatten file.lists as L
where L.task and L.checked or !L.task


Group by meta(L.section).subpath as Field 
sort rows.L.line

```

