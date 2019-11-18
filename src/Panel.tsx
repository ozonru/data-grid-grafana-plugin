import React, { PureComponent } from 'react';
import { getTheme, GrafanaThemeType, PanelProps, Table, Alert } from '@grafana/ui';
import { Options } from 'types';
import getDerivedDataFrame from './getDerivedDataFrame';

const INTERPOLATE_FUNCTION = value => value;
const NO_GROUPBY_LABEL = `Assign valid label to "Group by label" setting`;

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props> {
  public componentDidCatch(error, info) {
    console.error(error);
  }

  public render() {
    const { options, width, height } = this.props;

    if (!options.groupByLabel) {
      return <Alert title={NO_GROUPBY_LABEL} />;
    }

    const { series } = this.props.data;
    const { frame, columns } = getDerivedDataFrame(series, options);

    return (
      <Table
        theme={getTheme(GrafanaThemeType.Dark)}
        width={width}
        height={height}
        styles={columns}
        replaceVariables={INTERPOLATE_FUNCTION}
        data={frame}
        showHeader={options.showHeaders}
      />
    );
  }
}
