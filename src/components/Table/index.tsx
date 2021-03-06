/* tslint:disable */
import React, { Component, ReactElement } from 'react';
import { CellMeasurer, CellMeasurerCache, GridCellProps, Index, MultiGrid, SortDirectionType } from 'react-virtualized';
import { Themeable } from '@grafana/ui';
import { GrafanaTheme, ArrayVector, DataFrame, sortDataFrame, stringToJsRegex } from '@grafana/data';

import { getCellBuilder, simpleCellBuilder, TableCellBuilder, TableCellBuilderOptions } from './TableCellBuilder';
import { CustomColumnStyle } from '../../types';
import { ColumnHeader } from './ColumnHeader';
import './index.css';

export interface Props extends Themeable {
  data: DataFrame;

  minColumnWidth: number;
  showHeader: boolean;
  fixedHeader: boolean;
  fixedColumns: number;
  styles: CustomColumnStyle[];
  fixedColumnsWidth: { [k: string]: number };
  width: number;
  height: number;
  theme: GrafanaTheme;
}

interface State {
  sortBy?: number;
  sortDirection?: SortDirectionType;
  data: DataFrame;
}

interface ColumnRenderInfo {
  header: string;
  width: number;
  builder: TableCellBuilder;
}

interface DataIndex {
  column: number;
  row: number; // -1 is the header!
}

export class Table extends Component<Props, State> {
  public renderer: ColumnRenderInfo[];
  public measurer: CellMeasurerCache;
  public scrollToTop = false;

  public static defaultProps = {
    fixedColumns: 0,
    fixedHeader: true,
    minColumnWidth: 150,
    showHeader: true,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      data: props.data,
    };

    this.renderer = this.initColumns(props);
    this.measurer = new CellMeasurerCache({
      defaultHeight: 30,
      fixedWidth: true,
    });
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const { data, styles, showHeader } = this.props;
    const { sortBy, sortDirection } = this.state;
    const dataChanged = data !== prevProps.data;
    const configsChanged =
      showHeader !== prevProps.showHeader ||
      this.props.fixedColumns !== prevProps.fixedColumns ||
      this.props.fixedHeader !== prevProps.fixedHeader;

    // Reset the size cache
    if (dataChanged || configsChanged) {
      this.measurer.clearAll();
    }

    // Update the renderer if options change
    // We only *need* do to this if the header values changes, but this does every data update
    if (dataChanged || styles !== prevProps.styles) {
      this.renderer = this.initColumns(this.props);
    }

    // Update the data when data or sort changes
    if (dataChanged || sortBy !== prevState.sortBy || sortDirection !== prevState.sortDirection) {
      this.scrollToTop = true;
      this.setState({ data: sortDataFrame(data, sortBy, sortDirection === 'DESC') });
    }
  }

  /** Given the configuration, setup how each column gets rendered */
  public initColumns(props: Props): ColumnRenderInfo[] {
    const { styles, data, width, minColumnWidth, fixedColumnsWidth } = props;
    if (!data || !data.fields || !data.fields.length || !styles) {
      return [];
    }

    let fixedColumns = Object.keys(fixedColumnsWidth);
    let fixedWidth: number = fixedColumns.reduce((acc: number, key) => acc + fixedColumnsWidth[key], 0);

    const columnWidth = Math.max((width - fixedWidth) / (data.fields.length - fixedColumns.length), minColumnWidth);

    return data.fields.map((col, index) => {
      let title = col.name;
      let style: CustomColumnStyle | null = null; // ColumnStyle

      // Find the style based on the text
      for (let i = 0; i < styles.length; i++) {
        const s = styles[i];
        const regex = stringToJsRegex(s.pattern);
        if (title.match(regex)) {
          style = s;
          if (s.alias) {
            title = title.replace(regex, s.alias);
          }
          break;
        }
      }

      return {
        builder: getCellBuilder(col.config, style, this.props.theme),
        header: title,
        width: fixedColumnsWidth[col.name] || columnWidth,
      };
    });
  }

  // ----------------------------------------------------------------------
  // ----------------------------------------------------------------------

  public doSort = (columnIndex: number) => {
    let sort: any = this.state.sortBy;
    let dir = this.state.sortDirection;
    if (sort !== columnIndex) {
      dir = 'DESC';
      sort = columnIndex;
    } else if (dir === 'DESC') {
      dir = 'ASC';
    } else {
      sort = null;
    }
    this.setState({ sortBy: sort, sortDirection: dir });
  };

  /** Converts the grid coordinates to DataFrame coordinates */
  public getCellRef = (rowIndex: number, columnIndex: number): DataIndex => {
    const { showHeader } = this.props;
    const rowOffset = showHeader ? -1 : 0;

    return { column: columnIndex, row: rowIndex + rowOffset };
  };

  public onCellClick = (rowIndex: number, columnIndex: number) => {
    const { row, column } = this.getCellRef(rowIndex, columnIndex);
    if (row < 0) {
      this.doSort(column);
    }
  };

  public headerBuilder = (cell: TableCellBuilderOptions): ReactElement<'div'> => {
    const { data, sortBy, sortDirection } = this.state;
    const { columnIndex, rowIndex, style } = cell.props;
    const { column } = this.getCellRef(rowIndex, columnIndex);

    let col = data.fields[column];
    const sorting = sortBy === column;

    return (
      <ColumnHeader
        onClick={() => this.onCellClick(rowIndex, columnIndex)}
        style={style}
        text={col.config.displayName || col.name}
        sorting={sorting}
        sortDirection={sortDirection}
      />
    );
  };

  public getTableCellBuilder = (column: number): TableCellBuilder => {
    const render = this.renderer[column];
    if (render && render.builder) {
      return render.builder;
    }
    return simpleCellBuilder; // the default
  };

  public cellRenderer = (props: GridCellProps): React.ReactNode => {
    const { rowIndex, columnIndex, key, parent } = props;
    const { row, column } = this.getCellRef(rowIndex, columnIndex);
    const { data } = this.state;

    const isHeader = row < 0;
    const value = isHeader ? '' : (data.fields[column].values as ArrayVector).get(row);
    const builder = isHeader ? this.headerBuilder : this.getTableCellBuilder(column);

    return (
      <CellMeasurer cache={this.measurer} columnIndex={columnIndex} key={key} parent={parent} rowIndex={rowIndex}>
        {builder({
          props,
          value,
        })}
      </CellMeasurer>
    );
  };

  public getColumnWidth = (col: Index): number => {
    return this.renderer[col.index].width;
  };

  public render() {
    const { showHeader, fixedHeader, fixedColumns, width, height } = this.props;
    const { data } = this.state;
    if (!data || !data.fields || !data.fields.length) {
      return <span>Missing Fields</span>; // nothing
    }

    let columnCount = data.fields.length;
    let rowCount = data.length + (showHeader ? 1 : 0);

    let fixedColumnCount = Math.min(fixedColumns, columnCount);
    let fixedRowCount = showHeader && fixedHeader ? 1 : 0;

    // Called after sort or the data changes
    const scrollToRow = this.scrollToTop ? 1 : -1;
    const scrollToColumn = -1;
    if (this.scrollToTop) {
      this.scrollToTop = false;
    }

    // Force MultiGrid to rerender if these options change
    // See: https://github.com/bvaughn/react-virtualized#pass-thru-props
    const refreshKeys = {
      ...this.state, // Includes data and sort parameters
      d1: this.props.data,
      s0: this.props.styles,
    };
    return (
      <MultiGrid
        {...refreshKeys}
        scrollToRow={scrollToRow}
        columnCount={columnCount}
        scrollToColumn={scrollToColumn}
        rowCount={rowCount}
        overscanColumnCount={8}
        overscanRowCount={8}
        columnWidth={this.getColumnWidth}
        deferredMeasurementCache={this.measurer}
        cellRenderer={this.cellRenderer}
        rowHeight={this.measurer.rowHeight}
        width={width}
        height={height}
        fixedColumnCount={fixedColumnCount}
        fixedRowCount={fixedRowCount}
        classNameTopLeftGrid="gf-table-fixed-column"
        classNameBottomLeftGrid="gf-table-fixed-column"
      />
    );
  }
}

export default Table;
