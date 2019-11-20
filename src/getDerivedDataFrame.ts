import { ColumnOption, Options } from './types';
import { ArrayVector, DataFrame, Field, FieldType, MappingType, reduceField } from '@grafana/data';
import { ColumnStyle } from '@grafana/ui/components/Table/TableCellBuilder';
import { ColorDefinition, getColorByName, getColorForTheme, GrafanaThemeType } from '@grafana/ui';

const EMPTY_RESULT = {
  columns: [],
  frame: {
    fields: [],
    length: 0,
  },
};

type GetColumnOptions = (name: string) => ColumnOption;

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
  const field: Field<string, ArrayVector<string>> = {
    config: option
      ? {
          noValue: option.noValue,
          title: option.title,
        }
      : {},
    name,
    type: option ? FieldType.number : FieldType.string,
    values: new ArrayVector(),
  };
  frame.fields.push(field);

  return field;
}

function mapColors(color: string): string {
  if (color[0] === '#') {
    return color;
  }

  return getColorForTheme(getColorByName(color) as ColorDefinition, GrafanaThemeType.Dark);
}

function columnOptionToStyle({ decimals, rangeMap, valueMap, rawDataType, colorMode, colors, column, thresholds, unit }: ColumnOption): ColumnStyle {
  const result: ColumnStyle = {
    colorMode,
    colors: colors && colors.length > 0 ? colors.map(mapColors) : undefined,
    decimals,
    pattern: column || '',
    thresholds: thresholds && thresholds.length > 0 ? thresholds : undefined,
    type: rawDataType,
    unit: unit,
  };

  if (valueMap && valueMap.length > 0) {
    result.mappingType = MappingType.ValueToText;
    result.type = 'string';
    result.valueMaps = valueMap.map(([value, to]) => ({ value, text: to.toString() }));
  } else if (rangeMap && rangeMap.length > 0) {
    result.mappingType = MappingType.RangeToText;
    result.type = 'string';
    result.rangeMaps = rangeMap.map(([from, to, text]) => ({ from, to, text }));
  }

  return result;
}

function createColumnStylesHandler(option: Options) {
  const styles = new Map<string, ColumnStyle>();
  const defaultStyle: ColumnStyle = columnOptionToStyle(option.defaultColumnOption);

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

        const resultStyle = columnOptionToStyle(option.options[i]);

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

export default function getDerivedDataFrame(series: DataFrame[], options: Options): { frame: DataFrame; columns: ColumnStyle[] } {
  if (series.length === 0) {
    return EMPTY_RESULT;
  }

  const { groupByLabel } = options;

  if (!groupByLabel) {
    return EMPTY_RESULT;
  }

  const indexCache: { [k: string]: number } = Object.create(null);
  const labelsSet = new Set<string>();
  const styles = createColumnStylesHandler(options);
  const frame: DataFrame = {
    fields: [],
    length: 0,
  };
  const getColumnOption = createColumnHandler(options);
  const labelColumn: Field<string, ArrayVector<string>> = createField(frame, groupByLabel);

  if (!options.showLabelColumn) {
    frame.fields = [];
  }

  for (let i = 0; i < series.length; i++) {
    const { name, fields, labels = {} } = series[i];

    if (!labels[groupByLabel] || !name) {
      continue;
    }

    const fieldIndex = indexCache[name];
    const [newIndex, fieldInResultedFrame] =
      fieldIndex !== undefined
        ? [fieldIndex, frame.fields[fieldIndex] as Field<string, ArrayVector<string>>]
        : [frame.fields.length, createField(frame, name, getColumnOption)];

    indexCache[name] = newIndex;

    const option = getColumnOption(name);
    const reducerData = {
      field: fields[0],
      reducers: [option.type],
    };
    const mapResult = data => data[option.type];

    fieldInResultedFrame.values.add(mapResult(reduceField(reducerData)));
    labelsSet.add(labels[groupByLabel]);
    styles.getFor(name);
  }

  labelColumn.values = new ArrayVector<string>(Array.from(labelsSet));
  frame.length = labelColumn.values.length;

  return frame.fields.length === 0 ? EMPTY_RESULT : { columns: styles.getAll(), frame };
}
