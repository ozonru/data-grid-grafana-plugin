import { ColumnTemplate, StatType } from './types';
import kbn from 'grafana/app/core/utils/kbn';

export class ColumnOptions implements ColumnTemplate {
  static copyWith(option: ColumnOptions, column?: string, type?: StatType, unit?: string, delimiter?: number, filterable?: boolean): ColumnTemplate {
    return new ColumnOptions(
      type || option.type,
      column || option.type,
      unit || option.unit,
      delimiter || option.delimiter,
      filterable || option.filterable
    );
  }

  type;
  column?;
  unit?;
  delimiter?;
  filterable?;

  constructor(type: StatType, column?: string, unit?: string, delimiter?: number, filterable?: boolean) {
    this.type = type;
    this.column = column;
    this.unit = unit;
    this.delimiter = delimiter;
    this.filterable = filterable;
  }
}

let formats;

export function loadFormats() {
  if (!formats) {
    formats = kbn.getUnitFormats().map(({ text, submenu }) => ({
      label: text,
      options: submenu.map(({ text: label, value }) => ({ value, label })),
    }));
  }

  return formats;
}
