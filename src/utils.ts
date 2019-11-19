import { ColumnOption, RangeMap, ValueMap } from './types';
import kbn from 'grafana/app/core/utils/kbn';
import { ReducerID } from '@grafana/data';
import { getNamedColorPalette } from '@grafana/ui';

export class ColumnSetting implements ColumnOption {
  public static copyWith(
    option: ColumnSetting,
    column?: string,
    type?: ReducerID,
    unit?: string,
    addUnitToTitle?: boolean,
    decimals?: number,
    filterable?: boolean,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode'],
    colorsOption?: string[],
    thresholds?: number[],
    noValue?: string,
    valueMap?: ValueMap,
    rangeMap?: RangeMap
  ): ColumnOption {
    return new ColumnSetting(
      type || option.type,
      unit || option.unit,
      addUnitToTitle || option.addUnitToTitle,
      column || option.column,
      decimals || option.decimals,
      rawDataType || option.rawDataType,
      colorMode || option.colorMode,
      colorsOption || option.colors,
      thresholds || option.thresholds,
      noValue || option.noValue,
      valueMap || option.valueMap,
      rangeMap || option.rangeMap
    );
  }

  public type;
  public column?;
  public unit;
  public addUnitToTitle;
  public decimals?;
  public colorMode?;
  public rawDataType?;
  public thresholds?;
  public rangeMap?;
  public valueMap?;
  public colors?;
  public noValue?;

  constructor(
    type: ReducerID,
    unit: string,
    addUnitToTitle: boolean,
    column?: string,
    decimals?: number,
    rawDataType?: ColumnOption['rawDataType'],
    colorMode?: ColumnOption['colorMode'],
    colorsOption?: string[],
    thresholds?: number[],
    noValue?: string,
    valueMap?: ValueMap,
    rangeMap?: RangeMap
  ) {
    this.type = type;
    this.column = column;
    this.unit = unit;
    this.addUnitToTitle = addUnitToTitle;
    this.decimals = decimals;
    this.rawDataType = rawDataType;
    this.colorMode = colorMode;
    this.colors = colorsOption;
    this.thresholds = thresholds;
    this.valueMap = valueMap;
    this.rangeMap = rangeMap;
    this.noValue = noValue;
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
