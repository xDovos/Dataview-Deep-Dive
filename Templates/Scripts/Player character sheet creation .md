---
Type: Temp

---

# Character sheet creation



## Base info

- name:: 
- gender::
- age::
- birthday::
- Player_Name:: 

## Stats

- str::
- dex::
- con::
- int::
- wis::
- cha::

## Appearance 

- eyes::
- hair::
- height::
- weight::
- skin::


## Note
Change to Reading view with Ctrl + E to fill out the remaining points
## Alignment 

- [ ] (alignment:: Good) (desc:: " : A tendency to be a good person")
- [ ] (alignment:: Neutral) (desc:: " : A tendency to be a Neutral person")
- [ ] (alignment:: evil) (desc:: " : A tendency to be a evil person")
- [ ] (alignment:: chaotic) (desc:: " : A tendensy to be a chaos person")


## Class

- [ ] (pc_class:: "Rouge") (desc:: " : A class description for the rouge")
- [ ] (pc_class:: "Knight") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Archer") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Assassin") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Mage-Apprentice") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Archmage") (desc:: " : A class description for the ")
- [ ] (pc_class:: "King") (desc:: " : A class description for the ")
- [ ] (pc_class:: "Peasant") (desc:: " : A class description for the ")

## Race

- [ ] (race:: "Human") (desc:: " : a human")
- [ ] (race:: "Elf") (desc:: " : a Elf")
- [ ] (race:: "dwarf") (desc:: " : a Dwarf")

## Profession 

- [ ] (profession:: "Blacksmith")
- [ ] (profession:: "Enchanter")


# Overview Character

```dataview
Table rows.L.text
where file.path = this.file.path
flatten file.lists as L
where L.task and L.checked or !L.task


Group by meta(L.section).subpath as Field 
sort rows.L.line

```

