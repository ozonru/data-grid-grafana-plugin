import { ReducerID } from '@grafana/data';

export interface ColumnStyle {
  pattern: string;
  alias?: string;
  colorMode?: 'cell' | 'value';
  colors?: any[];
  decimals?: number;
  thresholds?: any[];
  type?: 'date' | 'number' | 'string' | 'hidden';
  unit?: string;
  dateFormat?: string;
  sanitize?: boolean;
  mappingType?: any;
  valueMaps?: any;
  rangeMaps?: any;
  link?: any;
  linkUrl?: any;
  linkTooltip?: any;
  linkTargetBlank?: boolean;
  preserveFormat?: boolean;
}

export type ValueMap = Array<[number | string, number | string]>;
export type RangeMap = Array<[number, number, number | string]>;

export interface ColumnOption {
  decimals?: number;
  colorMode?: 'value' | 'cell';
  colors?: string[];
  column?: string;
  thresholds?: number[];
  discreteColors: boolean;
  type: ReducerID;
  rangeMap?: RangeMap;
  rawDataType?: 'string' | 'number' | 'date';
  title?: string;
  valueMap?: ValueMap;
  noValue?: string;
  unit: string;
  width?: number;
  viewLabel?: string;
}

export interface Options {
  defaultColumnOption: ColumnOption;
  options: ColumnOption[];
  showLabelColumn: boolean;
  groupByLabel?: string;
  firstColumnSize?: number;
  minColumnSizePx?: number;
}

export type CustomColumnStyle = ColumnStyle & { discreteColors: boolean };
