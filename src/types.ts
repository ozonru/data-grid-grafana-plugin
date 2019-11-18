import { ReducerID } from '@grafana/data';

export type ValueMap = [number | string, number | string][];
export type RangeMap = [number, number, number | string][];

export interface ColumnOption {
  addUnitToTitle: boolean;
  decimals?: number;
  colorMode?: 'value' | 'cell';
  colors?: string[];
  column?: string;
  thresholds?: number[];
  type: ReducerID;
  rangeMap?: RangeMap;
  rawDataType?: 'string' | 'number' | 'date';
  valueMap?: ValueMap;
  unit: string;
}

export interface Options {
  defaultColumnOption: ColumnOption;
  options: ColumnOption[];
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
