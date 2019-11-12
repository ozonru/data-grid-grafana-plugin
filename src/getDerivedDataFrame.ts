import { Options } from './types';
import { ArrayVector, DataFrame, Field, FieldType } from '@grafana/data';

const EMPTY_FRAME = {
  fields: [],
  length: 0,
};

function createField(frame: DataFrame, name: string) {
  const field: Field<string, ArrayVector<string>> = {
    config: {},
    name,
    type: FieldType.string,
    values: new ArrayVector(),
  };
  frame.fields.push(field);

  return field;
}

export default function getDerivedDataFrame(series: DataFrame[], options: Options): DataFrame {
  if (series.length === 0) {
    return EMPTY_FRAME;
  }

  const { groupByLabel } = options;

  if (!groupByLabel) {
    return EMPTY_FRAME;
  }

  const indexCache: { [k: string]: number } = Object.create(null);
  const labelsSet = new Set<string>();
  const frame: DataFrame = {
    fields: [],
    length: 0,
  };
  const labelColumn: Field<string, ArrayVector<string>> = createField(frame, groupByLabel /* TODO */);

  for (let i = 0; i < series.length; i++) {
    const { name, fields, labels = {} } = series[i];

    if (!labels[groupByLabel] || !name) {
      continue;
    }

    const fieldIndex = indexCache[name];
    // TODO create correct field
    const [newIndex, fieldInResultedFrame] = fieldIndex
      ? [fieldIndex, frame.fields[fieldIndex] as Field<string, ArrayVector<string>>]
      : [frame.fields.length, createField(frame, name)];

    indexCache[name] = newIndex;

    // TODO compute value
    fieldInResultedFrame.values.add(fields[0].values.get(0).toString());
    labelsSet.add(labels[groupByLabel]);
  }

  labelColumn.values = new ArrayVector<string>(Array.from(labelsSet));
  frame.length = labelColumn.values.length;

  return frame.fields.length === 0 ? EMPTY_FRAME : frame;
}
