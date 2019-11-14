export enum StatType {
  Max = 'Max',
  Min = 'Min',
  Avg = 'Average',
  Total = 'Total',
}

export interface ColumnTemplate {
  columns: string[];
  delimiter?: number;
  type: StatType;
  name?: string;
}

export interface Options {
  templates: ColumnTemplate[];
  defaultTemplate: ColumnTemplate;
  showHeaders: boolean;
  showLabelColumn: boolean;
  groupByLabel?: string;
}
