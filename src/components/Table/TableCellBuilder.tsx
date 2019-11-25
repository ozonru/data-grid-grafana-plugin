// Libraries
import _ from 'lodash';
import React, { ReactElement } from 'react';
import { GridCellProps } from 'react-virtualized';
import { ValueFormatter, getValueFormat, getColorFromHexRgbOrName, GrafanaTheme, getDecimalsForValue } from '@grafana/ui';
import { Field, RangeMap, ValueMap } from '@grafana/data';
import { ColumnStyle } from '@grafana/ui/components/Table/TableCellBuilder';

type ValueMapper = (value: any) => any;
export interface TableCellBuilderOptions {
  value: any;
  className?: string;
  props: GridCellProps;
}

const EMPTY_VALUE = '-';

export type TableCellBuilder = (cell: TableCellBuilderOptions) => ReactElement<'div'>;

/** Simplest cell that just spits out the value */
export const simpleCellBuilder: TableCellBuilder = (cell: TableCellBuilderOptions) => {
  const { props, value, className } = cell;
  const { style } = props;

  return (
    <div style={style} className={'gf-table-cell ' + className}>
      {value}
    </div>
  );
};

function valueMapper(value: number | string, style: ColumnStyle) {
  if (style.valueMaps && style.valueMaps.length > 0) {
    for (let i = 0; i < style.valueMaps.length; i++) {
      const mapper = style.valueMaps[i] as ValueMap;

      if (mapper.value === value) {
        return mapper.text;
      }
    }
  } else if (style.rangeMaps && style.rangeMaps.length > 0) {
    for (let i = 0; i < style.rangeMaps.length; i++) {
      const mapper = style.rangeMaps[i] as RangeMap;

      if (mapper.from <= value && mapper.to >= value) {
        return mapper.text;
      }
    }
  }

  return value;
}

export function getCellBuilder(schema: Field['config'], style: ColumnStyle | null, theme: GrafanaTheme): TableCellBuilder {
  if (!style) {
    return simpleCellBuilder;
  }

  if (style.type === 'string') {
    return new CellBuilderWithStyle(
      (v: any) => {
        if (Array.isArray(v)) {
          v = v.join(', ');
        }

        if (v === null || v === undefined) {
          return schema.noValue || EMPTY_VALUE;
        }
        return v;
      },
      style,
      theme
    ).build;
  }

  if (style.type === 'number') {
    const valueFormatter = getValueFormat(style.unit || schema.unit || 'none');
    return new CellBuilderWithStyle(
      (v: any) => {
        if (v === null || v === undefined) {
          return schema.noValue || EMPTY_VALUE;
        }
        return v;
      },
      style,
      theme,
      valueFormatter
    ).build;
  }

  return simpleCellBuilder;
}

class CellBuilderWithStyle {
  constructor(private mapper: ValueMapper, private style: ColumnStyle, private theme: GrafanaTheme, private fmt?: ValueFormatter) {}

  public getColorForValue = (value: any): string | null => {
    const { thresholds, colors } = this.style;
    if (!colors) {
      return null;
    }

    if (!thresholds || thresholds.length === 0) {
      return getColorFromHexRgbOrName(_.first(colors), this.theme.type);
    }

    for (let i = thresholds.length; i > 0; i--) {
      if (value >= thresholds[i - 1]) {
        return getColorFromHexRgbOrName(colors[i], this.theme.type);
      }
    }

    return getColorFromHexRgbOrName(_.first(colors), this.theme.type);
  }

  public build = (cell: TableCellBuilderOptions) => {
    let { props } = cell;
    let value = this.mapper(cell.value);

    if (_.isNumber(value)) {
      if (this.fmt) {
        const { decimals } = getDecimalsForValue(value, this.style.decimals);
        value = this.fmt(value, decimals);
      }

      // For numeric values set the color
      const { colorMode } = this.style;
      if (colorMode) {
        const color = this.getColorForValue(Number(value));
        if (color) {
          if (colorMode === 'cell') {
            props = {
              ...props,
              style: {
                ...props.style,
                backgroundColor: color,
                color: 'white',
              },
            };
          } else if (colorMode === 'value') {
            props = {
              ...props,
              style: {
                ...props.style,
                color: color,
              },
            };
          }
        }
      }
    }

    return simpleCellBuilder({ value: valueMapper(value, this.style), props });
  }
}
