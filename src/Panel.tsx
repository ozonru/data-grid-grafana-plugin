import React, { PureComponent } from 'react';
import { PanelProps, Alert, ThemeContext } from '@grafana/ui';
import Table from './components/Table';
import { Options } from 'types';
import getDerivedDataFrame from './getDerivedDataFrame';
import validateOptions from './validateOptions';

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props> {
  public componentDidCatch(error, info) {
    console.error(error);
  }

  public render() {
    let validationError;
    const { options, width, height } = this.props;

    if ((validationError = validateOptions(options))) {
      return <Alert title={validationError} />;
    }

    const { series } = this.props.data;
    const { frame, columns } = getDerivedDataFrame(series, options);

    return (
      <ThemeContext.Consumer>
        {theme => (
          <Table
            theme={theme}
            width={width}
            height={height}
            styles={columns}
            data={frame}
            showHeader={options.showHeaders}
            fixedColumnsWidth={options.options.map(({ width }) => width || options.defaultColumnOption.width)}
            minColumnWidth={options.minColumnSizePx}
          />
        )}
      </ThemeContext.Consumer>
    );
  }
}
