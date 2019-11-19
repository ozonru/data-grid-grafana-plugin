import React, { PureComponent } from 'react';
import {PanelProps, Alert, ThemeContext, GrafanaTheme} from '@grafana/ui';
import Table from './components/Table';
import { Options } from 'types';
import getDerivedDataFrame from './getDerivedDataFrame';

const NO_GROUPBY_LABEL = `Assign valid label to "Group by label" setting`;

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props, undefined, GrafanaTheme> {
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
      <ThemeContext.Consumer>
        {
          theme => (
            <Table
              theme={theme}
              width={width}
              height={height}
              styles={columns}
              data={frame}
              showHeader={options.showHeaders}
            />
          )
        }
      </ThemeContext.Consumer>
    );
  }
}
