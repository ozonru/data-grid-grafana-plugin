/* tslint:disable */
import _ from 'lodash';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import React, { ReactElement } from 'react';
import { GridCellProps } from 'react-virtualized';
import {
  Field,
  RangeMap,
  ValueMap,
  ValueFormatter,
  getValueFormat,
  getColorFromHexRgbOrName,
  GrafanaTheme,
  getDecimalsForValue,
} from '@grafana/data';
import { CustomColumnStyle } from '../../types';

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
    <div title={value} style={style} className={'gf-table-cell-custom ' + className}>
      {value}
    </div>
  );
};

function valueMapper(value: number | string, style: CustomColumnStyle) {
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

export function getCellBuilder(
  schema: Field['config'],
  style: CustomColumnStyle | null,
  theme: GrafanaTheme
): TableCellBuilder {
  if (!style) {
    return simpleCellBuilder;
  }

  if (style.type === 'string') {
    return new CellBuilderWithStyle(
      (v: any) => {
        if (Array.isArray(v)) {
          v = v.join(', ');
        }

        if (v === null || v === undefined || v === '') {
          return schema.noValue || EMPTY_VALUE;
        }
        return v;
      },
      style,
      theme
    ).build;
  }

  if (style.type === 'number') {
    const baseFormatter = getValueFormat(style.unit || schema.unit || 'none');
    const valueFormatter = (...args) => {
      // @ts-ignore
      const { text, suffix } = (baseFormatter(...args) as unknown) as { text: string; suffix: string };

      return (text || '') + (suffix || '');
    };
    return new CellBuilderWithStyle(
      (v: any) => {
        if (v === null || v === undefined) {
          return schema.noValue || EMPTY_VALUE;
        }
        return v;
      },
      style,
      theme,
      // @ts-ignore
      valueFormatter
    ).build;
  }

  return simpleCellBuilder;
}

class CellBuilderWithStyle {
  private scales: { [k: string]: ScaleLinear<string, string> } = {};

  constructor(
    private mapper: ValueMapper,
    private style: CustomColumnStyle,
    private theme: GrafanaTheme,
    private fmt?: ValueFormatter
  ) {}

  public getColorForValue = (value: any): string | null => {
    const { thresholds, colors } = this.style;
    const returnFirst = () => getColorFromHexRgbOrName(_.first(colors), this.theme.type);
    if (!colors) {
      return null;
    }

    if (!thresholds || thresholds.length === 0) {
      return returnFirst();
    }

    for (let i = thresholds.length; i > 0; i--) {
      if (value >= thresholds[i - 1]) {
        if (this.style.discreteColors) {
          return getColorFromHexRgbOrName(colors[i], this.theme.type);
        }

        if (i === thresholds.length) {
          return getColorFromHexRgbOrName(_.last(colors), this.theme.type);
        }

        let scale = this.scales[thresholds[i - 1]];

        if (scale) {
          return scale(value);
        }

        const color1 = getColorFromHexRgbOrName(colors[i - 1], this.theme.type);
        const color2 = getColorFromHexRgbOrName(colors[i], this.theme.type);

        scale = scaleLinear<string>()
          .domain([thresholds[i - 1], thresholds[i]])
          .range([color1, color2]);

        this.scales[thresholds[i - 1]] = scale;

        return scale(value);
      }
    }

    return returnFirst();
  };

  public build = (cell: TableCellBuilderOptions) => {
    let { props } = cell;
    let value = this.mapper(cell.value);
    let formatted = value;

    if (_.isNumber(value)) {
      // For numeric values set the color
      const { colorMode } = this.style;
      if (colorMode) {
        const color = this.getColorForValue(value);
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

      if (this.fmt) {
        const { decimals } = getDecimalsForValue(value, this.style.decimals);
        formatted = this.fmt(value, decimals);
      } else {
        formatted = value;
      }
    }

    const mapped = valueMapper(value, this.style);

    return simpleCellBuilder({ value: mapped === value ? formatted : mapped, props });
  };
}
