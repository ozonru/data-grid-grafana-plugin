import React, { Component } from 'react';
import { Options } from 'types';
import { Switch, getTheme, GrafanaThemeType, Select, FormField } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import { SelectableValue } from '@grafana/data';

type ICommonOptions = Omit<Options, 'templates'>;

type Props = {
  options: ICommonOptions;
  labels?: string[];
  loading?: boolean;
  onChange: (options: ICommonOptions) => void;
};

const theme = getTheme(GrafanaThemeType.Dark);
const ERROR_INFO_STYLE = {
  alignSelf: 'center',
  color: theme.colors.critical,
  flex: 1,
  fontSize: '14px',
  marginLeft: '7px',
};

const WARN_INFO_STYLE = {
  ...ERROR_INFO_STYLE,
  color: theme.colors.warn,
};

const ICON_STYLE = {
  marginRight: '7px',
};

export default class CommonOptions extends Component<Props> {
  private handleShowHeadersChange = (e?: React.SyntheticEvent) => {
    this.props.onChange({
      ...this.props.options,
      // @ts-ignore
      showHeaders: e ? e.target.checked : false,
    });
  }

  private handleShowLabelsColumnChange = (e?: React.SyntheticEvent) => {
    this.props.onChange({
      ...this.props.options,
      // @ts-ignore
      showLabelColumn: e ? e.target.checked : false,
    });
  }

  private handleGroupBySelect = (selected: SelectableValue<string>) => {
    this.props.onChange({
      ...this.props.options,
      groupByLabel: selected.value,
    });
  }

  // public shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
  //   return (
  //     this.props.options.hideHeaders !== nextProps.options.hideHeaders ||
  //     this.props.options.groupByLabel !== nextProps.options.groupByLabel ||
  //     this.props.labels !== this.props.labels
  //   );
  // }

  private renderInfo(text: string, error?: boolean) {
    return (
      <span style={error ? ERROR_INFO_STYLE : WARN_INFO_STYLE}>
        <i className="fa fa-exclamation-triangle" style={ICON_STYLE} />
        {text}
      </span>
    );
  }

  public render() {
    const { options, labels = [], loading } = this.props;
    const selectOptions: Array<SelectableValue<string>> = labels.map(label => ({ value: label, label }));
    const selected: SelectableValue<string> = {
      label: options.groupByLabel || '',
      value: options.groupByLabel || '',
    };
    const switchLabelClass = `width-${LABEL_WIDTH}`;

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
                  <FormField
                    label="Group by label"
                    labelWidth={LABEL_WIDTH}
                    inputEl={
                      <Select<string>
                        isClearable
                        isSearchable
                        isMulti={false}
                        width={FORM_ELEMENT_WIDTH}
                        onChange={this.handleGroupBySelect}
                        value={selected}
                        options={selectOptions}
                      />
                    }
                  />
                  {loading ? this.renderInfo('Loading series') : labels.length === 0 && this.renderInfo('No series provided', true)}
                </div>
                <div className="gf-form">
                  <Switch label="Show headers" labelClass={switchLabelClass} onChange={this.handleShowHeadersChange} checked={options.showHeaders} />
                </div>
                <div className="gf-form">
                  <Switch
                    label="Show Labels"
                    labelClass={switchLabelClass}
                    onChange={this.handleShowLabelsColumnChange}
                    checked={options.showLabelColumn}
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
