import { ColumnOption, Options } from './types';
import { ArrayVector, DataFrame, Field, FieldType, reduceField } from '@grafana/data';
import { ColumnStyle } from '@grafana/ui/components/Table/TableCellBuilder';

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
    config: {},
    name,
    type: option ? FieldType.number : FieldType.string,
    values: new ArrayVector(),
  };
  frame.fields.push(field);

  return field;
}

function createColumnStyles(seriesColumns: string[], option: Options): ColumnStyle[] {
  const result = [] as ColumnStyle[];
  const defaultStyle: ColumnStyle = {
    decimals: option.defaultColumnOption.decimals,
    pattern: '',
    type: option.defaultColumnOption.rawDataType,
    unit: option.defaultColumnOption.unit,
  };
  const series = new Set(seriesColumns);

  for (let i = 0; i < option.options.length; i++) {
    const { column } = option.options[i];

    // No data
    if (!series.has(column as string)) {
      continue;
    }

    const { decimals, unit, rawDataType } = option.options[i];

    result.push({
      decimals: decimals,
      pattern: column as string,
      type: rawDataType,
      unit,
    });

    series.delete(column as string);
  }

  const rest = Array.from(series);

  for (let i = 0; i < rest.length; i++) {
    result.push({
      ...defaultStyle,
      pattern: rest[i],
    });
  }

  return result;
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
  const columnsSet = new Set<string>();
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
    columnsSet.add(name);
  }

  labelColumn.values = new ArrayVector<string>(Array.from(labelsSet));
  frame.length = labelColumn.values.length;

  return frame.fields.length === 0 ? EMPTY_RESULT : { columns: createColumnStyles(Array.from(columnsSet), options), frame };
}
