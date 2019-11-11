import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/ui';
import { Options } from 'types';

interface Props extends PanelProps<Options> {}

export default class Panel extends PureComponent<Props> {
  public render() {
    return <div>Hello from Panel side!</div>;
  }
}
