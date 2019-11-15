import { Options, StatType } from './types';
import { ColumnOptions } from './utils';

export const LABEL_WIDTH = 10;
export const DEFAULT_COLUMN_TEMPLATE = -1;
export const FORM_ELEMENT_WIDTH = 15;
export const TEMPLATE_INDEX = -12;
export const ADD_TEMPLATE_INDEX = -11;
export const COMMON_OPTIONS_INDEX = -10;

export const defaults: Options = {
  defaultTemplate: new ColumnOptions(StatType.Total, undefined, 'none', undefined, true),
  groupByLabel: undefined,
  showHeaders: true,
  showLabelColumn: true,
  templates: [],
};
