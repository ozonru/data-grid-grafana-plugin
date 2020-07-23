import { ColumnOption, Options } from './types';
import { NO_GROUPBY_LABEL, THRESHOLDS_COUNT_DOES_NOT_FIT } from './consts';

function validateColumnOption(option: ColumnOption): string | null {
  if (
    option.thresholds &&
    option.colors &&
    option.thresholds.length > 0 &&
    option.colors.length < option.thresholds.length + 1
  ) {
    return THRESHOLDS_COUNT_DOES_NOT_FIT;
  }

  return null;
}

export default function(options: Options): string | null {
  if (!options.groupByLabel) {
    return NO_GROUPBY_LABEL;
  }

  for (let i = 0; i < options.options.length; i++) {
    let valid;
    const column = options.options[i];

    if ((valid = validateColumnOption(column))) {
      return `${column.column || 'Default column'}:${valid}`;
    }
  }

  return null;
}
