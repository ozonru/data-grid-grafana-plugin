import { ReducerID } from '@grafana/data';

export interface ColumnOption {
  decimals?: number;
  delimiter?: number;
  colorMode?: 'value' | 'cell';
  colors?: string[];
  column?: string;
  thresholds?: number[];
  type: ReducerID;
  rawDataType?: 'string' | 'number' | 'date';
  unit?: string;
}

export interface Options {
  defaultColumnOption: ColumnOption;
  options: ColumnOption[];
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
