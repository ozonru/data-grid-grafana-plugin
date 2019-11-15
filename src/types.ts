export enum StatType {
  Max = 'Max',
  Min = 'Min',
  Avg = 'Average',
  Total = 'Total',
}

export interface ColumnTemplate {
  column?: string;
  unit?: string;
  delimiter?: number;
  filterable?: boolean;
  type: StatType;
}

export interface Options {
  templates: ColumnTemplate[];
  defaultTemplate: ColumnTemplate;
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
