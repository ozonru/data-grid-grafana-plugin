import { ReducerID } from '@grafana/data';

export interface ColumnOption {
  column?: string;
  unit?: string;
  delimiter?: number;
  filterable?: boolean;
  type: ReducerID;
}

export interface Options {
  options: ColumnOption[];
  defaultColumnOption: ColumnOption;
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
