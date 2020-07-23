import { ColumnOption, CustomColumnStyle, Options } from './types';
import {
  ArrayVector,
  DataFrame,
  Field,
  FieldType,
  getColorByName,
  getColorForTheme,
  GrafanaTheme,
  Labels,
  MappingType,
  reduceField,
} from '@grafana/data';
import { CSS_COLORS } from './consts';

type GetColumnOptions = (name: string) => ColumnOption;

const EMPTY_LABEL = 'NO_LABEL_VAlUE';
const EMPTY_RESULT = {
  columns: [],
  frame: {
    fields: [],
    length: 0,
  },
};

function createColumnHandler(options: Options): GetColumnOptions {
  const columns = {};

  return function getColumn(name: string) {
    if (columns[name]) {
      return columns[name];
    }

    return (columns[name] = options.options.find(({ column }) => column === name) || options.defaultColumnOption);
  };
}

function createField(frame: DataFrame, name: string, getColumnOption?: GetColumnOptions) {
  const option = getColumnOption ? getColumnOption(name) : undefined;
  const type = option && option.viewLabel === undefined ? FieldType.number : FieldType.string;
  const field: Field<string, ArrayVector<string>> = {
    config: option
      ? {
          noValue: option.noValue,
          displayName: option.title,
        }
      : {},
    name,
    type,
    values: new ArrayVector(new Array(frame.length).fill(type === FieldType.string ? '' : null)),
  };
  frame.fields.push(field);

  return field;
}

function mapColors(theme: GrafanaTheme, color: string): string {
  if (color[0] === '#') {
    return color;
  }

  const definition = getColorByName(color);

  if (definition) {
    return getColorForTheme(definition, theme.type);
  }

  return CSS_COLORS[color] || color;
}

function columnOptionToStyle(
  theme: GrafanaTheme,
  {
    decimals,
    rangeMap,
    valueMap,
    rawDataType,
    colorMode,
    colors,
    column,
    thresholds,
    unit,
    discreteColors,
  }: ColumnOption
): CustomColumnStyle {
  const result: CustomColumnStyle = {
    colorMode,
    colors: colors && colors.length > 0 ? colors.map(color => mapColors(theme, color)) : undefined,
    decimals,
    discreteColors,
    pattern: column || '',
    thresholds: thresholds && thresholds.length > 0 ? thresholds : undefined,
    type: rawDataType,
    unit: unit,
  };

  if (valueMap && valueMap.length > 0) {
    result.mappingType = MappingType.ValueToText;
    result.valueMaps = valueMap.map(([value, to]) => ({ value, text: to.toString() }));
  } else if (rangeMap && rangeMap.length > 0) {
    result.mappingType = MappingType.RangeToText;
    result.rangeMaps = rangeMap.map(([from, to, text]) => ({ from, to, text }));
  }

  return result;
}

function createColumnStylesHandler(theme: GrafanaTheme, option: Options) {
  const styles = new Map<string, CustomColumnStyle>();
  const defaultStyle = columnOptionToStyle(theme, option.defaultColumnOption);

  return {
    getAll: () => Array.from(styles.values()),
    getFor: (serie: string) => {
      if (styles.has(serie)) {
        return styles.get(serie);
      }

      for (let i = 0; i < option.options.length; i++) {
        const { column } = option.options[i];

        // No data
        if (serie !== column) {
          continue;
        }

        const resultStyle = columnOptionToStyle(theme, option.options[i]);

        styles.set(serie, resultStyle);
        return resultStyle;
      }

      const result = {
        ...defaultStyle,
        pattern: serie,
      };

      styles.set(serie, result);
      return result;
    },
  };
}

export function getLabels(frame: DataFrame): Labels {
  const labels: Labels = {};

  if (frame.fields.length > 0) {
    frame.fields.forEach(({ labels: fieldLabels }) => {
      if (!fieldLabels) {
        return;
      }

      Object.assign(labels, fieldLabels);
    });
  }

  return labels;
}

export default function getDerivedDataFrame(
  theme: GrafanaTheme,
  series: DataFrame[],
  options: Options
): { frame: DataFrame; columns: CustomColumnStyle[] } {
  if (series.length === 0) {
    return EMPTY_RESULT;
  }

  const { groupByLabel } = options;

  if (!groupByLabel) {
    return EMPTY_RESULT;
  }

  const labelsSet = new Set<string>();
  const styles = createColumnStylesHandler(theme, options);
  const frame: DataFrame = {
    fields: [],
    length: 0,
  };
  const getColumnOption = createColumnHandler(options);
  const labelColumn: Field<string, ArrayVector<string>> = createField(frame, groupByLabel);

  if (!options.showLabelColumn) {
    frame.fields = [];
  }

  const buckets = new Map<string, DataFrame[]>();

  for (let i = 0; i < series.length; i++) {
    const { name } = series[i];
    const labels = getLabels(series[i]);

    if (!labels[groupByLabel] || !name) {
      continue;
    }

    let bucket = buckets.get(name);

    if (bucket) {
      bucket.push(series[i]);
    } else {
      bucket = [series[i]];
      buckets.set(name, bucket);
    }

    labelsSet.add(labels[groupByLabel]);
    styles.getFor(name);
  }

  const labelsArr = Array.from(labelsSet);
  const index = new Map(labelsArr.map((label, i) => [label, i]));
  labelColumn.values = new ArrayVector<string>(labelsArr);
  frame.length = labelColumn.values.length;

  for (const [name, bucketSeries] of buckets) {
    const field = createField(frame, name, getColumnOption);
    const option = getColumnOption(name);

    for (let i = 0; i < bucketSeries.length; i++) {
      const labels = getLabels(bucketSeries[i]);
      const label = labels[groupByLabel];
      let value: any;

      if (option.viewLabel === undefined) {
        const reducerData = {
          field: bucketSeries[i].fields[0],
          reducers: [option.type],
        };
        const mapResult = data => data[option.type];

        value = mapResult(reduceField(reducerData));
      } else {
        const val = labels[option.viewLabel];
        value = typeof val !== 'undefined' ? val : option.noValue || EMPTY_LABEL;
      }

      field.values.set(index.get(label)!, value);
    }
  }

  return frame.fields.length === 0 ? EMPTY_RESULT : { columns: styles.getAll(), frame };
}
