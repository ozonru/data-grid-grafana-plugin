import React, { Component } from 'react';
import { ColumnOption, StatType } from 'types';
import { FormField, Switch, Select } from '@grafana/ui';
import FormSelect from './FormSelect';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import EditorTab from './EditorTab';
import { ColumnSetting, loadFormats } from '../utils';
import { SelectableValue } from '@grafana/data';

interface Props {
  visible?: boolean;
  isDefault: boolean;
  option: ColumnOption;
  onChange: (template: ColumnOption) => void;
}

const TYPE_SELECT_OPTIONS: { value: string }[] = [
  { value: StatType.Avg },
  { value: StatType.Max },
  { value: StatType.Min },
  { value: StatType.Total },
];

export default class ColumnOptionComponent extends Component<Props> {
  private unitFormats = loadFormats();

  private changeWith: <T extends keyof ColumnOption>(key: T, value: ColumnOption[T]) => void = (key, value) => {
    const option = ColumnSetting.copyWith(this.props.option);

    option[key] = value;
    this.props.onChange(option);
  }

  private handleStatChange = (event: React.SyntheticEvent) => {
    // @ts-ignore
    const stat = event.target.value;

    this.changeWith('type', stat as StatType);
  }

  private handleDelimiterChange = (event: React.SyntheticEvent) => {
    // @ts-ignore
    const delimiter = Number(event.target.value);

    if (Number.isNaN(delimiter) || delimiter < 1) {
      return;
    }

    this.changeWith('delimiter', delimiter);
  }

  private handleFilterableStateChange = (event?: React.SyntheticEvent) => {
    // @ts-ignore
    const bool = event ? Boolean(event.target.value) : false;

    this.changeWith('filterable', bool);
  }

  private handleUnitChange = (item: SelectableValue<string>) => {
    this.changeWith('unit', item.value);
  }

  public render() {
    const { option: option, isDefault, visible } = this.props;

    return (
      <EditorTab visible={visible}>
        {!isDefault && (
          <div className="editor-row">
            <div className="section gf-form-group">
              <div className="gr-form-inline">
                <div className="gf-form">
                  <h6 className="text-header">General</h6>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="editor-row">
          <div className="section gf-form-group">
            <div className="gr-form-inline">
              <div className="gf-form">
                <h6 className="text-header">Appearance</h6>
              </div>
            </div>
            <div className="gr-form-inline">
              <div className="gf-form">
                <FormField
                  label="Delimiter"
                  placeholder="Enter delimiter"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  type="number"
                  onChange={this.handleDelimiterChange}
                  value={option.delimiter}
                />
              </div>
              <div className="gf-form">
                <Switch
                  label="Filterable"
                  labelClass={`width-${LABEL_WIDTH}`}
                  onChange={this.handleFilterableStateChange}
                  checked={option.filterable || false}
                />
              </div>
            </div>
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
                <FormSelect
                  label="Type"
                  labelWidth={LABEL_WIDTH}
                  selectWidth={FORM_ELEMENT_WIDTH}
                  options={TYPE_SELECT_OPTIONS}
                  onChange={this.handleStatChange}
                  value={option.type}
                />
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </EditorTab>
    );
  }
}
