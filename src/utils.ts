import { ColumnOption } from './types';
import kbn from 'grafana/app/core/utils/kbn';
import { ReducerID } from '@grafana/data';
import { getNamedColorPalette } from '@grafana/ui';

export class ColumnSetting implements ColumnOption {
  public static copyWith(
    option: ColumnSetting,
    column?: string,
    type?: ReducerID,
    unit?: string,
    delimiter?: number,
    filterable?: boolean,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode'],
    colorsOption?: string[],
    thresholds?: number[]
  ): ColumnOption {
    return new ColumnSetting(
      type || option.type,
      column || option.column,
      unit || option.unit,
      delimiter || option.delimiter,
      rawDataType || option.rawDataType,
      colorMode || option.colorMode,
      colorsOption || option.colors,
      thresholds || option.thresholds
    );
  }

  public type;
  public column?;
  public unit?;
  public delimiter?;
  public colorMode?;
  public rawDataType?;
  public thresholds?;
  public colors?;

  constructor(
    type: ReducerID,
    column?: string,
    unit?: string,
    delimiter?: number,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode'],
    colorsOption?: string[],
    thresholds?: number[]
  ) {
    this.type = type;
    this.column = column;
    this.unit = unit;
    this.delimiter = delimiter;
    this.rawDataType = rawDataType;
    this.colorMode = colorMode;
    this.colors = colorsOption;
    this.thresholds = thresholds;
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

let colors: string[] = [];

export function loadColors(): string[] {
  if (colors.length > 0) {
    return colors;
  }

  getNamedColorPalette().forEach(definitions => {
    for (let i = 0; i < definitions.length; i++) {
      if (definitions[i].variants.dark) {
        const clrName = definitions[i].name;
        colors.push(clrName);
      }
    }
  });

  return colors;
}

export function getColorsOptions(): { value: string; label: string }[] {
  if (colors.length === 0) {
    loadColors();
  }

  return colors.map(value => ({ value, label: value }));
}
