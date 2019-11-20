import React, { Component } from 'react';
import { Options } from 'types';
import { Switch, getTheme, GrafanaThemeType, Select, FormField } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import { SelectableValue } from '@grafana/data';
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

  private handleColumnWidthChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    const width = e.target.value;
    const widthNumber = parseInt(width, 10);

    if (Number.isNaN(widthNumber) || widthNumber < 10) {
      const newOptions = {
        ...this.props.options,
      };

      delete newOptions.minColumnSizePx;
      this.props.onChange(newOptions);
    }

    this.props.onChange({
      ...this.props.options,
      minColumnSizePx: widthNumber,
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
    const { options, labels = [], loading, visible } = this.props;
    const selectOptions: Array<SelectableValue<string>> = labels.map(label => ({ value: label, label }));
    const selected: SelectableValue<string> = {
      label: options.groupByLabel || '',
      value: options.groupByLabel || '',
    };
    const switchLabelClass = `width-${COMMON_OPTIONS_LABEL_WIDTH}`;

    return (
      <EditorTab visible={visible}>
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gf-form">
              <div className="gr-form-inline">
                <div className="gf-form">
                  <FormField
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
                  {loading ? this.renderInfo('Loading series') : labels.length === 0 && this.renderInfo('No series provided', true)}
                </div>
                <div className="gf-form">
                  <FormField
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
      </EditorTab>
    );
  }
}
