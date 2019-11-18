import React, { Component } from 'react';
import { ColumnOption, RangeMap, ValueMap } from 'types';
import { FormField, Select, StatsPicker, Switch } from '@grafana/ui';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import EditorTab from './EditorTab';
import { ColumnSetting, loadFormats } from '../utils';
import { ReducerID, SelectableValue } from '@grafana/data';
import ThresholdsForm from './ThresholdsForm';
import InputOnBlur from './InputOnBlur';

interface Props {
  visible?: boolean;
  isDefault: boolean;
  option: ColumnOption;
  onChange: (template: ColumnOption) => void;
}

type RawDataType = ColumnOption['rawDataType'];
type ColorModeType = ColumnOption['colorMode'];
type RangeOrValueMap = RangeMap | ValueMap;

const RANGE_MAP_REGEX = /(.+)-(.+)=(.+)/;
const VALUE_MAP_REGEX = /(.+)=(.+)/;
const EMPTY_ARRAY = [];
const rawTypeOptions: SelectableValue<RawDataType>[] = [
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
  { label: 'Date', value: 'date' },
];

const colorModeOptions: SelectableValue<ColorModeType>[] = [{ label: 'Value', value: 'value' }, { label: 'Cell', value: 'cell' }];

const splitStyle = {
  marginRight: '20px',
};

function isRangeMap(mapper: RangeOrValueMap): mapper is RangeMap {
  if (mapper[0]) {
    return mapper[0].length === 3;
  }

  return false;
}

function mapValueMappers(mapper: RangeOrValueMap): string {
  if (isRangeMap(mapper)) {
    return mapper.map(valueMap => `${valueMap[0]}-${valueMap[1]}=${valueMap[2]}`).join(', ');
  } else {
    return mapper.map(valueMap => `${valueMap[0]}=${valueMap[1]}`).join(', ');
  }
}

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
    this.changeWith('unit', item.value || 'none');
  }

  private handleAddUnitFlagChange = (e?: React.SyntheticEvent) => {
    // @ts-ignore
    this.changeWith('addUnitToTitle', e ? e.target.checked : false);
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

  private handleValueMapChange = (value: string) => {
    let rangeMap: undefined | boolean = undefined;
    const splitted = value.split(',');
    const result: RangeOrValueMap = [];

    for (let i = 0; i < splitted.length; i++) {
      const str = splitted[i].trim();
      let currentMap = RANGE_MAP_REGEX.exec(str);

      if (currentMap && rangeMap === false) {
        continue;
      }

      if (currentMap) {
        const num1 = parseFloat(currentMap[1]);
        const num2 = parseFloat(currentMap[2]);
        const mappedTo = currentMap[3];

        if (Number.isNaN(num1) || Number.isNaN(num2) || !mappedTo) {
          continue;
        }

        rangeMap = true;
        (result as RangeMap).push([num1, num2, mappedTo]);
      } else {
        currentMap = VALUE_MAP_REGEX.exec(str);

        if (!currentMap || rangeMap === true) {
          continue;
        }

        const val1 = currentMap[1];
        const val2 = currentMap[2];

        if (!val1 || !val2) {
          continue;
        }

        rangeMap = false;
        (result as ValueMap).push([val1, val2]);
      }
    }

    const option = ColumnSetting.copyWith(this.props.option);

    if (isRangeMap(result)) {
      option.rangeMap = result;
    } else {
      option.valueMap = result;
    }

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
                <span style={splitStyle} />
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
                <Switch
                  label="Add Unit to Title"
                  className={`width-${LABEL_WIDTH + FORM_ELEMENT_WIDTH}`}
                  labelClass={`width-${LABEL_WIDTH}`}
                  onChange={this.handleAddUnitFlagChange}
                  checked={option.addUnitToTitle}
                />
                <span style={splitStyle} />
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
                <span style={splitStyle} />
                <InputOnBlur<ValueMap | RangeMap>
                  label="Value Map"
                  placeholder="1=On,0=Off or 0-1=Fine,1-10=A lot"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  onChange={this.handleValueMapChange}
                  value={option.valueMap || option.rangeMap || EMPTY_ARRAY}
                  valueToString={mapValueMappers}
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
                      stats={option.type ? [option.type] : EMPTY_ARRAY}
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
