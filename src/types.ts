import { ReducerID } from '@grafana/data';

export type ValueMap = [number | string, number | string][];
export type RangeMap = [number, number, number | string][];

export interface ColumnOption {
  decimals?: number;
  colorMode?: 'value' | 'cell';
  colors?: string[];
  column?: string;
  thresholds?: number[];
  type: ReducerID;
  rangeMap?: RangeMap;
  rawDataType?: 'string' | 'number' | 'date';
  title?: string;
  valueMap?: ValueMap;
  noValue?: string;
  unit: string;
}

export interface Options {
  defaultColumnOption: ColumnOption;
  options: ColumnOption[];
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
  minColumnSizePx?: number;
}
