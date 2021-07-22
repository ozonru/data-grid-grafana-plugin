/* tslint:disable */
import React, { Component } from 'react';
import { ColumnOption, RangeMap, ValueMap } from 'types';
import { Button, ButtonSelect, Select, StatsPicker, Switch, LegacyForms } from '@grafana/ui';
import { CSS_COLORS, FORM_ELEMENT_WIDTH, LABEL_WIDTH, THRESHOLDS_COUNT_DOES_NOT_FIT } from '../consts';
import EditorTab from './EditorTab';
import { ColumnSetting, loadColors, loadFormats } from '../utils';
import { ReducerID, SelectableValue } from '@grafana/data';
import InputOnBlur from './InputOnBlur';

import { PanelOptionsGroup } from './PanelOptionsGroup/PanelOptionsGroup';

interface Props {
  labels: string[];
  visible?: boolean;
  isDefault: boolean;
  option: ColumnOption;
  restColumns: Array<SelectableValue<string>>;
  onChange: (template: ColumnOption) => void;
  onDelete: () => void;
  onCopy: (item: SelectableValue<string>) => void;
}

interface State {
  labels: Array<SelectableValue<string>>;
}

type RawDataType = ColumnOption['rawDataType'];
type ColorModeType = ColumnOption['colorMode'];
type RangeOrValueMap = RangeMap | ValueMap;

const SERIES_VALUE = 'Serie value';
const THRESHOLDS_TOOLTIP = `${THRESHOLDS_COUNT_DOES_NOT_FIT}. Comparing with raw data`;
const COPY_VALUE: SelectableValue<string> = { label: 'Copy for..', value: '' };
const RANGE_MAP_REGEX = /(.+)-(.+)=(.+)/;
const VALUE_MAP_REGEX = /(.+)=(.+)/;
const EMPTY_ARRAY = [];
const rawTypeOptions: Array<SelectableValue<RawDataType>> = [
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
  { label: 'Date', value: 'date' },
];

const colorModeOptions: Array<SelectableValue<ColorModeType>> = [
  { label: 'Value', value: 'value' },
  { label: 'Cell', value: 'cell' },
];

const actionsStyle = {
  display: 'flex',
  flexDirection: 'row' as 'row',
};

function isRangeMap(mapper: RangeOrValueMap): mapper is RangeMap {
  if (mapper[0]) {
    return mapper[0].length === 3;
  }

  return false;
}

function mapArrayToString(values: number[] | string[]) {
  return values.join(', ');
}

function mapValueMappers(mapper: RangeOrValueMap): string {
  if (isRangeMap(mapper)) {
    return mapper.map((valueMap) => `${valueMap[0]}-${valueMap[1]}=${valueMap[2]}`).join(', ');
  } else {
    return mapper.map((valueMap) => `${valueMap[0]}=${valueMap[1]}`).join(', ');
  }
}

export default class ColumnOptionComponent extends Component<Props, State> {
  private unitFormats = loadFormats();
  private colors = loadColors();
  private colorsString = `Theme colors: ${loadColors().join(',\n')}`;
  public state: State;

  public static getDerivedStateFromProps(props: Props): State {
    return {
      labels: [{ label: SERIES_VALUE, value: SERIES_VALUE }].concat(
        props.labels.map((value) => ({ label: value, value }))
      ),
    };
  }

  constructor(props) {
    super(props);

    this.state = ColumnOptionComponent.getDerivedStateFromProps(props);
  }

  private changeWith: <T extends keyof ColumnOption>(key: T, value: ColumnOption[T]) => void = (key, value) => {
    const option = ColumnSetting.copy(this.props.option);

    option[key] = value;
    this.props.onChange(option);
  };

  private handleStatChange = (stat: string | string[]) => {
    this.changeWith('type', ([] as ReducerID[]).concat(stat as ReducerID)[0]);
  };

  private handleDecimalsChange = (event: React.SyntheticEvent) => {
    // @ts-ignore
    const decimals = parseInt(event.target.value, 10);

    if (Number.isNaN(decimals)) {
      this.changeWith('decimals', undefined);
      return;
    }

    this.changeWith('decimals', decimals);
  };

  private handleUnitChange = (item: SelectableValue<string> | null) => {
    this.changeWith('unit', item ? item.value || 'none' : 'none');
  };

  private handleDataTypeChange = (item: SelectableValue<RawDataType>) => {
    this.changeWith('rawDataType', item.value);
  };

  private handleColorModeChange = (item: SelectableValue<ColorModeType>) => {
    this.changeWith('colorMode', item.value);
  };

  private handleNoValueChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    this.changeWith('noValue', e.target.value);
  };

  private handleWidthChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    const val = e.target.value;
    const num = parseInt(val, 10);

    if (Number.isNaN(num)) {
      this.changeWith('width', undefined);
    } else {
      this.changeWith('width', num);
    }
  };

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

        if (!currentMap) {
          continue;
        }

        let val1: string | number = parseFloat(currentMap[1]);

        if (Number.isNaN(val1)) {
          if (rangeMap === true) {
            continue;
          }

          val1 = currentMap[1];
        }

        const val2 = currentMap[2];

        if ((!val1 && val1 !== 0) || !val2) {
          continue;
        }

        if (rangeMap) {
          (result as RangeMap).push([val1 as number, val1 as number, val2]);
        } else {
          rangeMap = false;
          (result as ValueMap).push([val1, val2]);
        }
      }
    }

    const option = ColumnSetting.copy(this.props.option);

    if (isRangeMap(result)) {
      option.rangeMap = result;
      delete option.valueMap;
    } else {
      option.valueMap = result;
      delete option.rangeMap;
    }

    this.props.onChange(option);
  };

  private handleThresholdChange = (value: string) => {
    const splitted = value.split(',');
    const thresholds = new Set<number>();

    for (let i = 0; i < splitted.length; i++) {
      let num = parseFloat(splitted[i].trim());

      if (Number.isNaN(num)) {
        continue;
      }

      thresholds.add(num);
    }

    const option = ColumnSetting.copy(this.props.option);

    option.thresholds = Array.from(thresholds);
    this.props.onChange(option);
  };

  private handleColorsChange = (value: string) => {
    const splitted = value.split(',');
    const colors = [] as string[];

    for (let i = 0; i < splitted.length; i++) {
      const str = splitted[i].trim();

      if (str[0] === '#') {
        colors.push(str);
      } else {
        const existsInTheme = this.colors.indexOf(str);

        if (existsInTheme === -1 && !CSS_COLORS[str]) {
          continue;
        }

        colors.push(str);
      }
    }

    const option = ColumnSetting.copy(this.props.option);

    option.colors = colors;
    this.props.onChange(option);
  };

  private handleTitleChange = (e: React.SyntheticEvent) => {
    // @ts-ignore
    const title = e.target.value;

    const option = ColumnSetting.copy(this.props.option);

    if (title) {
      option.title = title;
    } else {
      delete option.title;
    }
    this.props.onChange(option);
  };

  private handleDiscreteFlagChange = (e?: React.SyntheticEvent<HTMLInputElement>) => {
    // @ts-ignore
    const checked = !!e.target.checked;

    const option = ColumnSetting.copy(this.props.option);

    option.discreteColors = checked;

    this.props.onChange(option);
  };

  private handleValueSourceChange = ({ value }: SelectableValue<string>) => {
    const option = ColumnSetting.copy(this.props.option);

    if (value === SERIES_VALUE) {
      delete option.viewLabel;
    } else {
      option.viewLabel = value;
    }

    this.props.onChange(option);
  };

  public render() {
    const { option: option, visible, onDelete, restColumns, onCopy, isDefault } = this.props;

    return (
      <EditorTab visible={visible}>
        <div>
          <PanelOptionsGroup title="Value">
            <div className="section">
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Show value from"
                  tooltip="Select which value to show. Either series' value, either label from serie. If label selected, only 'title' and 'no value' appearance settings applied."
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<string>
                      placeholder="Select value source.. Series value by default"
                      isClearable={false}
                      isSearchable={false}
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleValueSourceChange}
                      value={{ label: option.viewLabel || SERIES_VALUE, value: option.viewLabel || SERIES_VALUE }}
                      options={this.state.labels}
                    />
                  }
                />
              </div>
            </div>
          </PanelOptionsGroup>
          <PanelOptionsGroup title="Appearance: General">
            <div className="section">
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Title"
                  tooltip="Will be displayed as column header"
                  placeholder="Query legend will be default title"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  value={option.title || ''}
                  onChange={this.handleTitleChange}
                />
              </div>
              <div className="gf-form">
                <LegacyForms.FormField
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
            <div className="section">
              <div className="gf-form">
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
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Decimals"
                  placeholder="auto"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  type="number"
                  onChange={this.handleDecimalsChange}
                  value={option.decimals || ''}
                />
              </div>
              <div className="gf-form">
                <LegacyForms.FormField
                  label="No Value"
                  placeholder="Enter text for null value"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  type="text"
                  onChange={this.handleNoValueChange}
                  value={option.noValue || ''}
                />
              </div>
            </div>
            <div className="section">
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Data Type"
                  tooltip="Type of raw data returned from source (e.g. Prometheus), in most cases Number"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<RawDataType>
                      placeholder="Select raw data type"
                      isClearable={false}
                      isSearchable={false}
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleDataTypeChange}
                      value={
                        option.rawDataType
                          ? rawTypeOptions.find(({ value }) => value === option.rawDataType)
                          : undefined
                      }
                      options={rawTypeOptions}
                    />
                  }
                />
              </div>
            </div>
          </PanelOptionsGroup>
          <PanelOptionsGroup title="Appearance: Colors">
            <div className="section">
              <div className="gf-form">
                <InputOnBlur<string[]>
                  label="Colors"
                  tooltip={this.colorsString}
                  placeholder="#0f0, semi-dark-orange, red"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  onChange={this.handleColorsChange}
                  value={option.colors || EMPTY_ARRAY}
                  valueToString={mapArrayToString}
                />
              </div>
              <div className="gf-form">
                <InputOnBlur<number[]>
                  label="Thresholds"
                  tooltip={THRESHOLDS_TOOLTIP}
                  placeholder="50, 80"
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  onChange={this.handleThresholdChange}
                  value={option.thresholds || EMPTY_ARRAY}
                  valueToString={mapArrayToString}
                />
              </div>
            </div>
            <div className="section">
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Color mode"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <Select<ColorModeType>
                      placeholder="Select color mode"
                      isClearable={false}
                      isSearchable={false}
                      isMulti={false}
                      width={FORM_ELEMENT_WIDTH}
                      onChange={this.handleColorModeChange}
                      value={
                        option.colorMode ? colorModeOptions.find(({ value }) => value === option.colorMode) : undefined
                      }
                      options={colorModeOptions}
                    />
                  }
                />
              </div>
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Discrete color range"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <div className="o3-form-field-switch-patch">
                      <Switch checked={!!option.discreteColors} onChange={this.handleDiscreteFlagChange} />
                    </div>
                  }
                />
              </div>
            </div>
          </PanelOptionsGroup>
          {!isDefault && (
            <PanelOptionsGroup title="Column">
              <div className="section">
                <div className="gf-form">
                  <LegacyForms.FormField
                    type="text"
                    label="Width (px)"
                    placeholder="auto"
                    labelWidth={LABEL_WIDTH}
                    inputWidth={FORM_ELEMENT_WIDTH}
                    value={option.width || ''}
                    onChange={this.handleWidthChange}
                  />
                </div>
              </div>
            </PanelOptionsGroup>
          )}
          <PanelOptionsGroup title="Stat">
            <div className="section">
              <div className="gf-form">
                <LegacyForms.FormField
                  label="Stat Type"
                  labelWidth={LABEL_WIDTH}
                  inputEl={
                    <StatsPicker
                      allowMultiple={false}
                      placeholder="Select unit"
                      className={`width-${FORM_ELEMENT_WIDTH}`}
                      onChange={this.handleStatChange}
                      stats={option.type ? [option.type] : EMPTY_ARRAY}
                    />
                  }
                />
              </div>
            </div>
          </PanelOptionsGroup>
          <div style={actionsStyle}>
            <Button onClick={onDelete} size="xs" variant="destructive">
              Delete
            </Button>
            {restColumns.length > 0 && (
              <div className="width-15">
                <ButtonSelect className="width-15" options={restColumns} value={COPY_VALUE} onChange={onCopy as any} />
              </div>
            )}
          </div>
        </div>
      </EditorTab>
    );
  }
}
