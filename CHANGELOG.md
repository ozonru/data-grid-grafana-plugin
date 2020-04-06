# Changelog

All notable changes to this project are documented in this file.

## 0.9.1

- Fix TableCellBuilder

## 0.9.0

- Support grafana 6.7.x

## 0.8.2

- Fix: bug with incorrect values when series have different length

## 0.8.1

- Refactor: column options

## 0.8.0

- Feature: add ability to choose column value source

## 0.7.0

- Fix: sorting raws

## 0.6.0

- Fix: support Grafana 6.5.x

## 0.5.5

- Fix: using mapped value instead of formatted, if possible

## 0.5.4

- Fix: value mapping does not block value formatting

## 0.5.3

- Publish production build

## 0.5.2

- Feat(Table): compare thresholds with raw data instead of formatted

## 0.5.1

- Fix(Table): parse formatted value to float instead of Number cast

## 0.5.0

- Feat: add ability to render color from continuous range
- Remove showHeaders parameter for table

## 0.4.0

- Feat: add ability to colorify column without thresholds
- Feat(Editor): remove filtering only unique colors
- Feat(Editor): support all css color names

## 0.3.0

- Feat(Editor): add column width option
- Feat(Panel): take column width for each cell if possible

## 0.2.0

-   Feat: add validation for number of thresholds and colors
-   Feat: support `auto` decimals
-   Feat: add logo icon
-   Feat(Editor): add extra tooltips, more informative placeholders
-   Fix: range map support
-   Fix(Panel): renaming error, when group by label did not choose
-   Fix(Panel): support custom titles
-   Fix: thresholds
-   Remove addUnitToTitle option

## 0.1.0

-   Initial plugin
