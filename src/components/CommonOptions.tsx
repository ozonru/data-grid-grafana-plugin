/* tslint:disable */
import React, { Component } from 'react';
import { Options } from 'types';
import { Switch, Select, LegacyForms, ThemeContext } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import { GrafanaTheme, SelectableValue } from '@grafana/data';
import EditorTab from './EditorTab';

type ICommonOptions = Omit<Options, 'options'>;

type Props = {
  options: ICommonOptions;
  labels?: string[];
  loading?: boolean;
  visible?: boolean;
  onChange: (options: ICommonOptions) => void;
};

const COMMON_OPTIONS_LABEL_WIDTH = LABEL_WIDTH + 4;

const ERROR_INFO_STYLE = {
  alignSelf: 'center',
  color: 'rgb(191, 27, 0)',
  flex: 1,
  fontSize: '14px',
  marginLeft: '7px',
};

const WARN_INFO_STYLE = {
  ...ERROR_INFO_STYLE,
  color: 'rgb(191, 106, 48)',
};
const ICON_STYLE = {
  marginRight: '7px',
};

export default class CommonOptions extends Component<Props> {
  private handleShowLabelsColumnChange = (e?: React.SyntheticEvent) => {
    this.props.onChange({
      ...this.props.options,
      // @ts-ignore
      showLabelColumn: e ? e.target.checked : false,
    });
  };

  private handleGroupBySelect = (selected: SelectableValue<string> | null) => {
    this.props.onChange({
      ...this.props.options,
      groupByLabel: selected && selected.value,
    });
  };

  private handleFirstColumnWidthChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    const width = e.target.value;
    const widthNumber = parseInt(width, 10);

    this.props.onChange({
      ...this.props.options,
      firstColumnSize: Number.isNaN(widthNumber) ? undefined : widthNumber,
    });
  };

  private handleColumnWidthChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    const width = e.target.value;
    const widthNumber = parseInt(width, 10);

    this.props.onChange({
      ...this.props.options,
      minColumnSizePx: Number.isNaN(widthNumber) ? undefined : widthNumber,
    });
  };

  // public shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
  //   return (
  //     this.props.options.hideHeaders !== nextProps.options.hideHeaders ||
  //     this.props.options.groupByLabel !== nextProps.options.groupByLabel ||
  //     this.props.labels !== this.props.labels
  //   );
  // }

  private renderInfo(theme: GrafanaTheme, text: string, error?: boolean) {
    return (
      <span style={error ? ERROR_INFO_STYLE : WARN_INFO_STYLE}>
        <i className="fa fa-exclamation-triangle" style={ICON_STYLE} />
        {text}
      </span>
    );
  }

  public render() {
    const { options, labels = [], loading, visible } = this.props;
    const selectOptions: Array<SelectableValue<string>> = labels.map(label => ({ value: label, label }));
    const selected: SelectableValue<string> = {
      label: options.groupByLabel || '',
      value: options.groupByLabel || '',
    };

    return (
      <EditorTab visible={visible}>
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gf-form">
              <div className="gr-form-inline">
                <div className="gf-form">
                  <LegacyForms.FormField
                    label="Group by label"
                    labelWidth={COMMON_OPTIONS_LABEL_WIDTH}
                    tooltip="This option is required to select rows for table"
                    inputEl={
                      <Select<string>
                        isClearable
                        isSearchable
                        isMulti={false}
                        width={FORM_ELEMENT_WIDTH}
                        onChange={this.handleGroupBySelect}
                        value={selected}
                        options={selectOptions}
                        isLoading={loading}
                      />
                    }
                  />
                  <ThemeContext.Consumer>
                    {theme =>
                      loading
                        ? this.renderInfo(theme, 'Loading series')
                        : labels.length === 0 && this.renderInfo(theme, 'No series provided', true)
                    }
                  </ThemeContext.Consumer>
                </div>
                <div className="gf-form">
                  <LegacyForms.FormField
                    type="number"
                    label="First Column width (px)"
                    placeholder="Fixed size"
                    labelWidth={COMMON_OPTIONS_LABEL_WIDTH}
                    inputWidth={FORM_ELEMENT_WIDTH}
                    value={options.firstColumnSize}
                    onChange={this.handleFirstColumnWidthChange}
                  />
                </div>
                <div className="gf-form">
                  <LegacyForms.FormField
                    type="number"
                    label="Min Column width (px)"
                    placeholder="Default is 150px"
                    labelWidth={COMMON_OPTIONS_LABEL_WIDTH}
                    inputWidth={FORM_ELEMENT_WIDTH}
                    value={options.minColumnSizePx}
                    onChange={this.handleColumnWidthChange}
                  />
                </div>
                <div className="gf-form">
                  <LegacyForms.FormField
                    label="Show Labels"
                    labelWidth={COMMON_OPTIONS_LABEL_WIDTH}
                    inputEl={
                      <div className="o3-form-field-switch-patch">
                        <Switch
                          className="o3-form-field-switch-patch"
                          onChange={this.handleShowLabelsColumnChange}
                          checked={options.showLabelColumn}
                        />
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </EditorTab>
    );
  }
}
