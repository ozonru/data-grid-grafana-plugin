import React, { PureComponent } from 'react';
import { getTheme, GrafanaThemeType, PanelProps, Table, Alert } from '@grafana/ui';
import { Options } from 'types';

const COLUMN_STYLES = [];
const INTERPOLATE_FUNCTION = value => value;
const EMPTY_FRAME = {
  fields: [],
  length: 0,
};

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props> {
  public render() {
    const {
      options: { groupByLabel },
    } = this.props;

    if (!groupByLabel) {
      return <Alert title={`Assign valid label to "Group by label" setting`} />;
    }

    const { series } = this.props.data;

    let filtered = series.filter(serie => serie.labels && Object.keys(serie.labels).includes(groupByLabel));

    return (
      <Table
        theme={getTheme(GrafanaThemeType.Dark)}
        width={this.props.width}
        height={this.props.height}
        styles={COLUMN_STYLES}
        replaceVariables={INTERPOLATE_FUNCTION}
        data={filtered[0] || EMPTY_FRAME}
        showHeader={!this.props.options.hideHeaders}
      />
    );
  }
}
