import { Options } from './types';
import { ColumnSetting } from './utils';
import { ReducerID } from '@grafana/data';

export const LABEL_WIDTH = 10;
export const DEFAULT_COLUMN_OPTIONS = -1;
export const FORM_ELEMENT_WIDTH = 15;
export const COLUMNS_INDEX = -12;
export const ADD_COLUMN_OPTION_INDEX = -11;
export const COMMON_OPTIONS_INDEX = -10;

export const defaults: Options = {
  defaultColumnOption: new ColumnSetting(ReducerID.last, 'none', undefined, undefined, 'number', 'cell', undefined, undefined, 'No data'),
  groupByLabel: undefined,
  options: [],
  showHeaders: true,
  showLabelColumn: true,
};
