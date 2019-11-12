import React, { PureComponent } from 'react';
import { getTheme, GrafanaThemeType, PanelProps, Table, Alert } from '@grafana/ui';
import { Options } from 'types';
import getDerivedDataFrame from './getDerivedDataFrame';

const COLUMN_STYLES = [];
const INTERPOLATE_FUNCTION = value => value;

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props> {
  public render() {
    const { options, width, height } = this.props;

    if (!options.groupByLabel) {
      return <Alert title={`Assign valid label to "Group by label" setting`} />;
    }

    const { series } = this.props.data;

    return (
      <Table
        theme={getTheme(GrafanaThemeType.Dark)}
        width={width}
        height={height}
        styles={COLUMN_STYLES}
        replaceVariables={INTERPOLATE_FUNCTION}
        data={getDerivedDataFrame(series, options)}
        showHeader={options.showHeaders}
      />
    );
  }
}
