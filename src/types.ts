export enum StatType {
  Max = 'Max',
  Min = 'Min',
  Avg = 'Average',
  Total = 'Total',
}

export interface ColumnOption {
  column?: string;
  unit?: string;
  delimiter?: number;
  filterable?: boolean;
  type: StatType;
}

export interface Options {
  options: ColumnOption[];
  defaultColumnOption: ColumnOption;
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
