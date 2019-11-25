import { ReducerID } from '@grafana/data';
import { ColumnStyle } from '@grafana/ui/components/Table/TableCellBuilder';

export type ValueMap = [number | string, number | string][];
export type RangeMap = [number, number, number | string][];

export interface ColumnOption {
  decimals?: number;
  colorMode?: 'value' | 'cell';
  colors?: string[];
  column?: string;
  thresholds?: number[];
  discreteColors: boolean;
  type: ReducerID;
  rangeMap?: RangeMap;
  rawDataType?: 'string' | 'number' | 'date';
  title?: string;
  valueMap?: ValueMap;
  noValue?: string;
  unit: string;
  width?: number;
}

export interface Options {
  defaultColumnOption: ColumnOption;
  options: ColumnOption[];
  showLabelColumn: boolean;
  groupByLabel?: string;
  firstColumnSize?: number;
  minColumnSizePx?: number;
}

export type CustomColumnStyle = ColumnStyle & { discreteColors: boolean };
