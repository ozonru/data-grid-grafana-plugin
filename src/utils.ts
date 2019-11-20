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
    width?: number,
    valueMap?: ValueMap,
    rangeMap?: RangeMap,
    title?: string
  ): ColumnOption {
    return new ColumnSetting(
      type || option.type,
      unit || option.unit,
      column || option.column,
      decimals || option.decimals,
      rawDataType || option.rawDataType,
      colorMode || option.colorMode,
      colorsOption || option.colors,
      thresholds || option.thresholds,
      noValue || option.noValue,
      width || option.width,
      valueMap || option.valueMap,
      rangeMap || option.rangeMap,
      title || option.title
    );
  }

  constructor(
    public type: ReducerID,
    public unit: string,
    public column?: string,
    public decimals?: number,
    public rawDataType?: ColumnOption['rawDataType'],
    public colorMode?: ColumnOption['colorMode'],
    public colors?: string[],
    public thresholds?: number[],
    public noValue?: string,
    public width?: number,
    public valueMap?: ValueMap,
    public rangeMap?: RangeMap,
    public title?: string
  ) {}
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

let colorsCache: string[] = [];

export function loadColors(): string[] {
  if (colorsCache.length > 0) {
    return colorsCache;
  }

  getNamedColorPalette().forEach(definitions => {
    for (let i = 0; i < definitions.length; i++) {
      if (definitions[i].variants.dark) {
        const clrName = definitions[i].name;
        colorsCache.push(clrName);
      }
    }
  });

  return colorsCache;
}
