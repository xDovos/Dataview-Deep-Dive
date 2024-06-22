/*
This DataviewJS View helps to add functionality to a Dataview Table.
THIS IS A BETA RELEASE - there are bugs and its not feature-complete
Version: v0.6.0

Given a Dataview Query, this view will
- Execute the query
- Extract the headers/columns of the result
- Render filters to adjust the Dataview table results
- Render the table results, filtering and re-rendering on filter changes

Important: This currently only supports
- Table queries (not list/tasks)
- Columns (fields) that are simple strings, links, and arrays of simple strings (no objects, etc)

Requirements
============
- Dataview with DataviewJS enabled
- ITS Callout snippet or Theme if you specify `filterColumnCount` or `its_cards`

Usage
=====
There is nothing fancy here, its a standard DataviewJS `dv.view` function which you can read about here:
- https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvviewpath-input

Quickstart
- Ensure "JavaScript Queries" is enabled in the Dataview Plugin's settings
- Download this `filtering_dv.js` file and save it to your vault's root-level `views` directory
- Within a note, create a dataviewjs codebock that calls the `filtering_dv` view and passes 
  args as needed. Here is a sample:
  
```dataviewjs
let input = {
  "query": 'TABLE without id file.link as NPC, race, sex, summary as "Summary" where type = "npc"',
  "filterColumnCount": 3,
  "markdownTable": false,
  "columnsWithoutFilters": ["Summary"],
  "filterCalloutColor": "blue",
  "its_cards": {
	  "enabled": false,
	  "columns": 3
  }
}
await dv.view("views/filtering_dv", input) 
```

Arguments
`query` (required) Dataview *TABLE* query

`filterColumnCount` (optional) Number of columns to use for filters; the column adjustment for the ITS
  `column` Callout. If excluded or `0`, each filter category will instead be in embedded withing their own 
  standard Obsdian Callout

`markdownTable` (optional) Boolean representing whether to use `dv.markdownTable` or `dv.table`. 
  Using `dv.table` can have poor performance on bigger result sets.

`columnsWithoutFilters` (Optional) String Array containing header/column names that should not get filter 
  features (but will still be included in the table).

`filterCalloutColor` (Optional, defaults="green"). If `filterColumnCount` is provided and not "0", this 
  values defines the background color.  Allowed values: [purple, blue, green, red, pink, orange, yellow, gray]
  
`its_cards` (Optional, defaults to `its_cards.enabled = false`) Object to control rendering the table using
  ITS `[cards|dataview]` callout.
  - `its_cards.enabled` (Optional, default=false) If true, dataview table will get rendered in `[cards|dataview]`
    callout
  - `its_cards.columns` (Optional, default=3) Number of columns for the ITS cards callout

Changelog
=========
- v0.6.0
	- Adds support for rendering a dataview table with ITS [cards|dataview]
	- Renames to `filtering_dv`
- v0.5.0
	- Adds support for filtering Link values
	- Major overhaul to avoid raw html and helped to support links
	- Adds `filterCalloutColor` support for ITS column callout
	- Adds support for custom header names
- v0.4.0
	- Adds support for `columnsWithoutFilters` to support table columns that display, but dont get filtered.
	- Adds some simple validation
	- Adds some short-circuit logic to improve performance when rendering without filters
	- Wraps the filtering/rendering in a try-catch to present errors more gracefully
- v0.3.0
	- Adds support for rendering a Dataview table or markdown table. Note: markdownTable has better performance
- v0.2.0
	- Adds in support for arrays as column values.  A row will be included if any of the values matches a filter
- v0.1.1
    - Adds in missing filter titles
    - Adds documentation
- v0.1.0
    - Adds support for text search on filename

TODO for v1.0.0 release
=======================
- Maybe some performance improvements...

Backlog
=======
- Apply CSS classes to everything for customization
- Add support for dataview LIST queries
- Try to save the filter selections to avoid the dataview double-render bug
- Add support for text search on other fields, configurable
- Add loading activity indicator when dv query is running
- Make the refresh button configurable (and move to the same line as the text search input element
- Cleanup global variables :rip:
*/

// Setup globals
let distinctValuesByColumn = []
let filters = []
let textSearch;

try {	
	// Parse inputs and validate
	if (!input.query) {
		dv.paragraph("Could not find required `query` argument. Check input args")
		return
	}
	let parsedQuery = await dv.tryQuery(input.query)
	if (parsedQuery.type !== "table") {
		dv.paragraph("query type " + parsedQuery.type + " is not yet supported")
		return
	}
	
	// set defaults
	let filterColumnsCount = input.filterColumnCount ? input.filterColumnCount : 0
	let calloutColor = input.filterCalloutColor ? input.filterCalloutColor : "green"
	let columnsWithoutFilters = input.columnsWithoutFilters ? input.columnsWithoutFilters : []

	// hidden element used as an anchor to clean up tables when re-rendering
	dv.span("", {cls: "refPoint"})

	// Render Text Search
	textSearch = dv.el("input", "", {attr: 
		{"placeholder": "Text Search...", "size": "50", "style": "font-size: 1em"}})
	textSearch.addEventListener('input', async (e) => run(e, parsedQuery))

	// Render filters
	if (filterColumnsCount != 0) {
		await filtersWithinColumns(filterColumnsCount, columnsWithoutFilters, calloutColor, parsedQuery);
	} else {
		await filtersWithinCallouts(columnsWithoutFilters, parsedQuery);
	}

	// Optional refresh button
	//dv.paragraph("")
	//const btn = dv.el('button', "Refresh")
	//btn.addEventListener('click', async (e) => {run(e, parsedQuery)})

	// Dummy element to get removed
	dv.paragraph("")

	// Render initial table
	run(null, parsedQuery);
} catch (error) {
	console.error(error)
	dv.paragraph("Error handling filtering_dv: " + error.toString())
}

// create an ITS `columns` Callout containing filter controls
async function filtersWithinColumns(columnCount, columnsWithoutFilters, calloutColor, parsedQuery) {
    let cc = createCallout("columns|" + columnCount + " bg-" + calloutColor, 
    	"-", 
		"Filters", 
		{attr: {"id": "callout_filter_columns", "style": "padding: 1em"}})
	
	// first (0) header is file name, skip it
    for (let headerIdx = 1; headerIdx < parsedQuery.headers.length; headerIdx++) {
    	if (columnsWithoutFilters.includes(parsedQuery.headers[headerIdx])) {
			continue;
		}
    	createFilter(parsedQuery, filters, cc, headerIdx)       
    }
}

// create an Obsidian Callouts containing filter controls
async function filtersWithinCallouts(columnsWithoutFilters, calloutColor, parsedQuery) {
    // first (0) header is file name, skip it
    for (let headerIdx = 1; headerIdx < parsedQuery.headers.length; headerIdx++) {
    	let columnName = parsedQuery.headers[headerIdx]
		if (columnsWithoutFilters.includes(columnName)) {
			continue;
		}
		let cc = createCallout("info",
			"-",
			columnName,
			{attr: {"id": "callout_filter_columns", "style": "padding: 1em"}})
		createFilter(parsedQuery, filters, cc, headerIdx)
    }
}

// Returns the container of the callout content after making the callout
//     let cc = createCallout("info", "hey")
//     dv.el("span", "rawr", {container: cc})
function createCallout(type, collapse, title, attrs) {
	let p = dv.paragraph(dv.parse("> [!" + type + "]" + collapse + " " + title + " \n>  "), attrs)
	let content = p.querySelectorAll(".callout-content")[0]
	content.parentNode.style.padding = "1em"
	// remove placeholder content
	content.querySelectorAll("p")[0].remove()
	return content
}

function createFilter(parsedQuery, filters, cc, headerIdx) {
	let columnName = parsedQuery.headers[headerIdx]
	distinctValuesByColumn[headerIdx] =
		dv.array(parsedQuery.values.map(row => row[headerIdx]).flat())
		    .distinct()
	filters[headerIdx] = []

	// build column of filters
	let someColumn = dv.el("span", "", {container:cc})
	dv.el("b", columnName + "<br/>", {container:someColumn})
	for (let v of distinctValuesByColumn[headerIdx]) {
		let cb = dv.el("input", "", {container:someColumn, attr: {
			"type": "checkbox", 
			"name": v,
			"class": "filter-checkbox cb-" + slugify(columnName),
			"id": v,
			"checked": true
		}})
		filters[headerIdx].push(cb)
		cb.addEventListener('input', async (e) => run(e, parsedQuery))

		// Links are difficult to use with the checkboxes; just use their display value.			
		let displayLabel = v.path ? v.fileName() : v
		dv.el("label", displayLabel, {container:someColumn, attr: {"for": v}})
		dv.el("br", "", {container:someColumn})
	}
		    
	// deselect all
	dv.el("button", "Deselect All", {container:someColumn, attr: {
		"name": "deselect_" + columnName,
		"id":  "deselect_" + columnName,
		"style": "margin-top: 1em"        	
	}}).addEventListener('click', async (e) => {
		let checkboxes = document.querySelectorAll('.cb-' + slugify(columnName))
		for (let i = 0; i < checkboxes.length; i++) {
		    checkboxes[i].checked = false
		}
		run(e, parsedQuery)
	})

	// select all
	dv.el("span", "&nbsp;", {container:someColumn})
	dv.el("button", "Select All", {container:someColumn, attr: {
		"name": "select_" + columnName,
		"id":  "select_" + columnName,
		"style": "margin-top: 1em"        	
	}}).addEventListener('click', async (e) => {
		let checkboxes = document.querySelectorAll('.cb-' + slugify(columnName))
		for (let i = 0; i < checkboxes.length; i++) {
		    checkboxes[i].checked = true
		}
		run(e, parsedQuery)
	})
}

// Returns true if item (cell value) is included in allowedValues.  If item is an array, checks if any 
// value in the array matches
function isIncluded(item, allowedValues) {
	// handle columnsWithoutFilters
	if (!allowedValues) {
		return true
	}	
    if (Array.isArray(item)) {
    	for (let val of item) {
    		if (allowedValues.indexOf(val) > -1) {
    			return true
    		}
    	}
    	return false
	} else if (item.path) {
		return allowedValues.map(allowed => dv.parse(allowed).path).includes(item.path)
    } else {
        return allowedValues.indexOf(item) > -1
    }
}

// returns true if row includes search value and conforms to allowedValuesByColumn. False otherwise
function rowIsAllowed(row, searchValue, allowedValuesByColumn) {
	// skip file.name column (0)
	for (let columnIdx = 1; columnIdx < allowedValuesByColumn.length; columnIdx++) {
	    if (!isIncluded(row[columnIdx], allowedValuesByColumn[columnIdx])) {
	        return false
	    }
	}
		
	// if searchValue, but not matching: move on
	if (searchValue != "" && !row[0].path.toLowerCase().includes(searchValue)) {
	    return false
	}
	
	return true;
}

// Parses filter states, applies filters to query results, and rerenders results
async function run(wrapperNode, parsedQuery) {
	// Remove last table or dummy element
    let table = document.querySelectorAll(".refPoint")[0].parentNode.lastChild
    table.remove()

	// Build up filtering config
    let allowedValues = []
    let anyFilters = false
    let results = parsedQuery.values
    for (let headerIdx = 1; headerIdx < parsedQuery.headers.length; headerIdx++) {
		// skip any columnsWithoutFilters
        if (!filters[headerIdx]) {
        	continue;
    	}
        allowedValues[headerIdx] = []
        for (let valIdx = 0; valIdx < filters[headerIdx].length; valIdx++) {
            if (filters[headerIdx][valIdx].checked) {
                allowedValues[headerIdx].push(filters[headerIdx][valIdx].name)
            } else {
            	anyFilters = true
            }
        }
    }
        
    // filter results
    const searchValue = textSearch.value
    let filteredResults = []
    if (anyFilters || searchValue != "") {
    	for (let row of results) {
    		if (rowIsAllowed(row, searchValue.toLowerCase(), allowedValues)) {
    			filteredResults.push(row)
    		}
   		}
    } else {
    	// short-circuit if nothing is unchecked and there is no search term
    	filteredResults = results
    }
    
    // render table
    if (input.markdownTable) {    
    	dv.paragraph(dv.markdownTable(parsedQuery.headers, filteredResults))
   	} else if (input.its_cards && input.its_cards.enabled) {
   		let cardColumns = input.its_cards.columns ? input.its_cards.columns : ""
	    let cc = createCallout("cards|dataview " + cardColumns, "", "Cards", {})
   		dv.api.table(parsedQuery.headers, filteredResults, cc, dv.component, dv.currentFilePath)
    } else {
	    dv.table(parsedQuery.headers, filteredResults)
    }
}

////////////////////////////
// Utilities
////////////////////////////

// Sluggify
// Source: https://byby.dev/js-slugify-string
function slugify(str) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}