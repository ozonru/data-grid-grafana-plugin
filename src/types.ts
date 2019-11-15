import { ReducerID } from '@grafana/data';

export interface ColumnOption {
  column?: string;
  unit?: string;
  delimiter?: number;
  type: ReducerID;
  colorMode?: 'value' | 'cell';
  rawDataType?: 'string' | 'number' | 'date';
}

export interface Options {
  options: ColumnOption[];
  defaultColumnOption: ColumnOption;
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
