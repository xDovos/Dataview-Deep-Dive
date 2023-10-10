---
Type: Tutorial
---
# basics
start with one | and write a header and press tab

| item     | 2nd head |
|:-------- |:-------- |
| buch     | 1        |
| squere   | 2        |
| w        | 3        |
| Ergebnis | 6        |
<!-- TBLFM: @>$2=sum(@I..@-1) -->

-   `@<` and `$<` mean the first row and first column, respectively.
-   `@>` and `$>` mean the last row and last column, respectively.
-   `@I` referrs to the line separating the table header from the table body

## Formula Components

This section will go into further detail about the different components which can be used in a formula. Some details will be repeats from the overview section above.


### Cell and Row References

Rows are always denoted by `@` and columns by `$`. Rows and columns can be specified as absolute values, or relative.

-   `@1` means the first row, and `@5` means the 5th row from the top.
-   `$1` means the first column, and `$5` means the 5th column from the left.
-   `@<` and `$<` mean the first row and first column, respectively.
-   `@>` and `$>` mean the last row and last column, respectively.
-   `@I` refers to the first row of content below the header.
-   `@-1` means the the row above the cell being filled.
-   `$+2` means the column two right of the cell being filled.

A row or column can be specified by themselves, or together in a combination. For example, `@5` means the 5th row in the current column. Similarly, `$5` means the 5th column in the current row. When used together, they indicate a single cell.

When used together, the row should always preceed the column.


### Ranges

With just rows and columns, the fomula is limited to selecting single cells, or full rows and columns. Using a range, a formula can select partial rows/columns, as well as multiple rows/columns.

Ranges are created with a row and/or column, two dots, and another row and/or column. For example `@1..@3`. Note however, that the components on both sides must match. A range can not be from a row to a column, or a cell to a row.

-   `@2..$4` - Invalid, can not range from a row to a column.
-   `@2$3..@5` - Valid, if column exists on first term and not second, it is carried to the second.
-   `@2$3..@5$5` - Valid, from one cell to another cell.
-   `$4..$6` - Valid, from one column to another column.

Ranges can be used to select portions of a row or column.

-   `@2$>..@5$>` - The last column, from row 2 to row 5. Arity `4x1`
-   `@3$<..@3$5` - The third row, from the first column to the 5th. Arity `1x5`

Ranges can also be used to select more than a row or column.

-   `@<..@>` - The entire row from the first row, to the last (the whole table).
-   `@3$1..@4$3` - From row 3 to row 4, from column 1 to 3. Arity `2x3`

### Algebraic Operations

Formulas can be used to add, subtract, multiply, and divide values in a table. All algebraic operations must be contained in parenthesis.


#### Add

When adding, at least one of the specified values must be a single cell. A formula may not add one range to another range.

-   `(@2$3+@3$4)` - Valid, adding two cells.
-   `(@2+@3$4)` - Valid, add the value in row two of the current cell, to the cell @3$4.
-   `(@2$3+$4)` - Valid, add the value in @2$3 to the value in the current row, column $4.
-   `(@2+@3)` - Valid, add the value in the current column of row 2 to the current column of row 3.
-   `@2$3+$4` - Invalid, missing parenthesis.

##### Add Example

In this table, the right column started out looking just like the left, with only the first two values filled. The formula fills the last column from row 4 to the last row. For each row, it adds the value of the previous two rows. You may recognize this as the [Fibonacci Sequence](https://en.wikipedia.org/wiki/Fibonacci_number)

| Start | Fibonacci |
|-------|-----------|
|     1 |         1 |
|     1 |         1 |
|       |         2 |
|       |         3 |
|       |         5 |
|       |         8 |
|       |        13 |
|       |        21 |
<!-- TBLFM: @4$>..@>$>=(@-1+@-2) -->