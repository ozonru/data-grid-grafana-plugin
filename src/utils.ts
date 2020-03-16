import { ColumnOption, RangeMap, ValueMap } from './types';
import kbn from 'grafana/app/core/utils/kbn';
import { ReducerID } from '@grafana/data';
import { getNamedColorPalette } from '@grafana/data';

export class ColumnSetting implements ColumnOption {
  public static copy(option: ColumnOption): ColumnOption {
    return new ColumnSetting(
      option.type,
      option.unit,
      option.discreteColors,
      option.column,
      option.decimals,
      option.rawDataType,
      option.colorMode,
      option.colors,
      option.thresholds,
      option.noValue,
      option.width,
      option.valueMap,
      option.rangeMap,
      option.title,
      option.viewLabel
    );
  }

  constructor(
    public type: ReducerID,
    public unit: string,
    public discreteColors: boolean,
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
    public title?: string,
    public viewLabel?: string
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
