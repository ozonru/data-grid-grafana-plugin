import React, { Component } from 'react';
import { Options } from 'types';
import { FormField, Switch } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';

type ICommonOptions = Omit<Options, 'templates'>;

type Props = {
  options: ICommonOptions;
  onChange: (options: ICommonOptions) => void;
};

export default class CommonOptions extends Component<Props> {
  private handleHideHeadersChange = (event?: React.SyntheticEvent) => {
    this.props.onChange({
      ...this.props.options,
      // @ts-ignore
      hideHeaders: event ? event.target.checked : false,
    });
  }

  private handleGroupBySelect = (event: React.SyntheticEvent) => {
    this.props.onChange({
      ...this.props.options,
      // @ts-ignore
      groupByLabel: event.target.value,
    });
  }

  public render() {
    const { options } = this.props;

    return (
      <div className="edit-tab-content">
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gr-form-inline">
              <div className="gf-form">
                <h6 className="text-header">Common Options</h6>
              </div>
            </div>
            <div className="gf-form">
              <div className="gr-form-inline">
                <div className="gf-form">
                  <Switch
                    label="Hide headers"
                    labelClass={`width-${LABEL_WIDTH}`}
                    onChange={this.handleHideHeadersChange}
                    checked={options.hideHeaders}
                  />
                </div>
                <div className="gf-form">
                  <FormField
                    type="text"
                    label="Group by label"
                    labelWidth={LABEL_WIDTH}
                    inputWidth={FORM_ELEMENT_WIDTH}
                    onChange={this.handleGroupBySelect}
                    value={options.groupByLabel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
