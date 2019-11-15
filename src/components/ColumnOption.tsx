import React, { Component } from 'react';
import { ColumnOption } from 'types';
import { FormField, Select, StatsPicker } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import EditorTab from './EditorTab';
import { ColumnSetting, loadFormats } from '../utils';
import { ReducerID, SelectableValue } from '@grafana/data';
import ThresholdsForm from './ThresholdsForm';

interface Props {
  visible?: boolean;
  isDefault: boolean;
  option: ColumnOption;
  onChange: (template: ColumnOption) => void;
}

type RawDataType = ColumnOption['rawDataType'];
type ColorModeType = ColumnOption['colorMode'];

const rawTypeOptions: SelectableValue<RawDataType>[] = [
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
  { label: 'Date', value: 'date' },
];

const colorModeOptions: SelectableValue<ColorModeType>[] = [{ label: 'Value', value: 'value' }, { label: 'Cell', value: 'cell' }];

const SPLIT_STYLE = {
  marginRight: '20px',
};

export default class ColumnOptionComponent extends Component<Props> {
  private unitFormats = loadFormats();

  private changeWith: <T extends keyof ColumnOption>(key: T, value: ColumnOption[T]) => void = (key, value) => {
    const option = ColumnSetting.copyWith(this.props.option);

    option[key] = value;
    this.props.onChange(option);
  }

  private handleStatChange = (stat: string | string[]) => {
    this.changeWith('type', ([] as ReducerID[]).concat(stat as ReducerID)[0]);
  }

  private handleDelimiterChange = (event: React.SyntheticEvent) => {
    // @ts-ignore
    const delimiter = Number(event.target.value);

    if (Number.isNaN(delimiter) || delimiter < 1) {
      this.changeWith('delimiter', undefined);
      return;
    }

    this.changeWith('delimiter', delimiter);
  }

  private handleUnitChange = (item: SelectableValue<string>) => {
    this.changeWith('unit', item.value);
  }

  private handleDataTypeChange = (item: SelectableValue<RawDataType>) => {
    this.changeWith('rawDataType', item.value);
  }

  private handleColorModeChange = (item: SelectableValue<ColorModeType>) => {
    this.changeWith('colorMode', item.value);
  }

  private handleThresholdsChange = ({ thresholds, colors }) => {
    const option = ColumnSetting.copyWith(this.props.option);

    option.thresholds = thresholds;
    option.colors = colors;
    this.props.onChange(option);
  }

  public render() {
    const { option: option, visible } = this.props;

    return (
      <EditorTab visible={visible}>
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gr-form-inline">
              <div className="gf-form">
                <h6 className="text-header">Appearance: General</h6>
              </div>
            </div>
            <div className="gr-form-inline">
              <div className="gf-form">
                <FormField
                  label="Unit format"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<string>
                      placeholder="Select unit"
                      isClearable
                      isSearchable
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleUnitChange}
                      value={option.unit ? { value: option.unit, label: option.unit } : undefined}
                      options={this.unitFormats}
                    />
                  }
                />
                <span style={SPLIT_STYLE} />
                <FormField
                  label="Decimals"
                  placeholder="Enter number of decimals"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  type="number"
                  onChange={this.handleDelimiterChange}
                  value={option.delimiter}
                />
              </div>
            </div>
            <div className="gr-form-inline">
              <div className="gf-form">
                <FormField
                  label="Data Type"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<RawDataType>
                      placeholder="Select raw data type"
                      isClearable={false}
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleDataTypeChange}
                      value={option.rawDataType ? rawTypeOptions.find(({ value }) => value === option.rawDataType) : undefined}
                      options={rawTypeOptions}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gr-form-inline">
              <div className="gf-form">
                <h6 className="text-header">Appearance: Colors</h6>
              </div>
            </div>
            <div className="gr-form-inline">
              <div className="gf-form">
                <FormField
                  label="Color mode"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<ColorModeType>
                      placeholder="Select color mode"
                      isClearable={false}
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleColorModeChange}
                      value={option.colorMode ? colorModeOptions.find(({ value }) => value === option.colorMode) : undefined}
                      options={colorModeOptions}
                    />
                  }
                />
              </div>
            </div>
            <ThresholdsForm thresholds={option.thresholds} colors={option.colors} onChange={this.handleThresholdsChange} />
          </div>
        </div>
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gr-form-inline">
              <div className="gf-form">
                <h6 className="text-header">Stat</h6>
              </div>
            </div>
            <div className="gr-form-inline">
              <div className="gf-form">
                <FormField
                  label="Stat Type"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <StatsPicker
                      allowMultiple={false}
                      placeholder="Select unit"
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleStatChange}
                      stats={option.type ? [option.type] : []}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </EditorTab>
    );
  }
}
