import _ from 'lodash';
import React, { PureComponent } from 'react';
import { PanelProps, GrafanaTheme } from '@grafana/data';
import { Alert, ThemeContext } from '@grafana/ui';
import Table from './components/Table';
import { Options } from 'types';
import getDerivedDataFrame from './getDerivedDataFrame';
import validateOptions from './validateOptions';

interface Props extends PanelProps<Options> {
  theme: GrafanaTheme;
}

class Panel extends PureComponent<Props> {
  public componentDidCatch(error, info) {
    console.error(error);
  }

  public render() {
    let validationError;
    const { options, width, height, theme } = this.props;

    if ((validationError = validateOptions(options))) {
      return <Alert title={validationError} />;
    }

    const { series } = this.props.data;
    const { frame, columns } = getDerivedDataFrame(theme, series, options);

    return (
      <Table
        showHeader
        theme={theme}
        width={width}
        height={height}
        styles={columns}
        data={frame}
        fixedColumnsWidth={options.options.reduce(
          (acc: { [k: string]: number }, { width: w, column }) => {
            if (column && _.isNumber(w)) {
              acc[column] = w as number;
            }

            return acc;
          },
          _.isNumber(options.firstColumnSize)
            ? { [options.groupByLabel as string]: options.firstColumnSize as number }
            : {}
        )}
        minColumnWidth={options.minColumnSizePx}
      />
    );
  }
}

export default function PanelWithTheme(props) {
  return <ThemeContext.Consumer>{theme => <Panel {...props} theme={theme} />}</ThemeContext.Consumer>;
}
