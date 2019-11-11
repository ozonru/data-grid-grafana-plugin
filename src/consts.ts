import { Options } from './types';

export const LABEL_WIDTH = 12;
export const FORM_ELEMENT_WIDTH = 20;
export const TEMPLATE_INDEX = -12;
export const ADD_TEMPLATE_INDEX = -11;
export const COMMON_OPTIONS_INDEX = -10;

export const defaults: Options = {
  activeTab: COMMON_OPTIONS_INDEX,
  groupByLabel: undefined,
  hideHeaders: false,
  templates: [],
};
