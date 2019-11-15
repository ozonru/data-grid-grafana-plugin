import { ColumnOption } from './types';
import kbn from 'grafana/app/core/utils/kbn';
import { ReducerID } from '@grafana/data';

export class ColumnSetting implements ColumnOption {
  public static copyWith(
    option: ColumnSetting,
    column?: string,
    type?: ReducerID,
    unit?: string,
    delimiter?: number,
    filterable?: boolean,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode']
  ): ColumnOption {
    return new ColumnSetting(
      type || option.type,
      column || option.column,
      unit || option.unit,
      delimiter || option.delimiter,
      rawDataType || option.rawDataType,
      colorMode || option.colorMode
    );
  }

  public type;
  public column?;
  public unit?;
  public delimiter?;
  public colorMode?;
  public rawDataType?;

  constructor(
    type: ReducerID,
    column?: string,
    unit?: string,
    delimiter?: number,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode']
  ) {
    this.type = type;
    this.column = column;
    this.unit = unit;
    this.delimiter = delimiter;
    this.rawDataType = rawDataType;
    this.colorMode = colorMode;
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
