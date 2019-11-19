// Libraries
import _ from 'lodash';
import React, { ReactElement } from 'react';
import { GridCellProps } from 'react-virtualized';
import { ValueFormatter, getValueFormat, getColorFromHexRgbOrName, GrafanaTheme } from '@grafana/ui';
import { Field } from '@grafana/data';
import {ColumnStyle} from '@grafana/ui/components/Table/TableCellBuilder';

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
          return schema.noValue || EMPTY_VALUE
        }
        return v;
      },
      style,
      theme,
      schema,
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
      schema,
      valueFormatter
    ).build;
  }

  return simpleCellBuilder;
}

class CellBuilderWithStyle {
  constructor(
    private mapper: ValueMapper,
    private style: ColumnStyle,
    private theme: GrafanaTheme,
    // @ts-ignore
    private column: Field['config'],
    private fmt?: ValueFormatter
  ) {}

  getColorForValue = (value: any): string | null => {
    const { thresholds, colors } = this.style;
    if (!thresholds || !colors) {
      return null;
    }

    for (let i = thresholds.length; i > 0; i--) {
      if (value >= thresholds[i - 1]) {
        return getColorFromHexRgbOrName(colors[i], this.theme.type);
      }
    }
    return getColorFromHexRgbOrName(_.first(colors), this.theme.type);
  };

  build = (cell: TableCellBuilderOptions) => {
    let { props } = cell;
    let value = this.mapper(cell.value);

    if (_.isNumber(value)) {
      if (this.fmt) {
        value = this.fmt(value, this.style.decimals);
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

    return simpleCellBuilder({ value, props });
  };
}
