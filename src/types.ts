export enum StatType {
  Max = 'Max',
  Min = 'Min',
  Avg = 'Average',
  Total = 'Total',
}

export interface ColumnTemplate {
  columns: string[];
  delimiter: number;
  type: StatType;
  name: string;
}

export interface Options {
  templates: ColumnTemplate[];
  activeTab: number;
  hideHeaders: boolean;
  groupByLabel?: string;
}
