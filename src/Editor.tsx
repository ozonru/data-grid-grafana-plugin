/* tslint:disable */
import cs from 'classnames';
import React, { PureComponent } from 'react';
import { Select } from '@grafana/ui';
import { LoadingState, SelectableValue, PanelData, PanelEditorProps } from '@grafana/data';

import ColumnOptionComponent from './components/ColumnOption';
import CommonOptions from './components/CommonOptions';
import { ColumnOption, Options } from './types';
import { ADD_COLUMN_OPTION_INDEX, DEFAULT_COLUMN_OPTIONS, COMMON_OPTIONS_INDEX, COLUMNS_INDEX } from './consts';
import { ColumnSetting } from './utils';
import { getLabels } from './getDerivedDataFrame';

type EditorState = {
  activeTab: number;
};

function createColumnOption(name: string, defaultColumn: ColumnOption): ColumnOption {
  const option = ColumnSetting.copy(defaultColumn);

  option.column = name;

  return option;
}

const optionStyle = { marginRight: '7px' };

const addColumnStyle = {
  marginBottom: '20px',
  padding: '0 13px',
};

const asideStyle = {
  minWidth: '200px',
};

const SELECT_VALUE = { label: 'Customize Column' };
const COLUMN_SELECT_NO_OPTION = () => 'All columns already customized';

export default class Editor extends PureComponent<PanelEditorProps<Options>, EditorState> {
  public static getColumnsAndLabels(data: PanelData): { labels: string[]; columns: Array<SelectableValue<string>> } {
    if (data.series.length === 0) {
      return { labels: [], columns: [] };
    }

    const labels = new Set<string>();
    const columns = new Set<string>();

    for (let i = 0; i < data.series.length; i++) {
      const serie = data.series[i];

      if (serie.name) {
        columns.add(serie.name);
      }

      const serieLabels = getLabels(serie);

      Object.keys(serieLabels).forEach(label => labels.add(label));
    }

    return { labels: Array.from(labels), columns: Array.from(columns).map(cl => ({ value: cl, label: cl })) };
  }

  constructor(props, ctx) {
    super(props, ctx);

    this.state = {
      activeTab: COMMON_OPTIONS_INDEX,
    };
  }

  private handleColumnChange = (newOption: ColumnOption) => {
    if (this.state.activeTab === DEFAULT_COLUMN_OPTIONS) {
      this.props.onOptionsChange({ ...this.props.options, defaultColumnOption: newOption });
      return;
    }

    const options = this.props.options.options.slice();

    options[this.state.activeTab] = newOption;
    this.props.onOptionsChange({ ...this.props.options, options });
  };

  private handleOptionDelete = () => {
    const i = this.state.activeTab;
    const options = this.props.options.options.slice();

    options.splice(i, 1);
    this.props.onOptionsChange({ ...this.props.options, options });
    this.setState({
      ...this.state,
      activeTab: options.length === 0 ? -1 : i - 1,
    });
  };

  private handleOptionCopy = (newCol: SelectableValue<string>) => {
    const i = this.state.activeTab;
    const options = this.props.options.options.slice();
    const option = ColumnSetting.copy(options[i]);

    option.column = newCol.value;
    options.push(option);
    this.props.onOptionsChange({ ...this.props.options, options });
    this.setState({
      ...this.state,
      activeTab: options.length - 1,
    });
  };

  private handleOptionChange = (options: Omit<Options, 'options'>) => {
    this.props.onOptionsChange({
      ...this.props.options,
      ...options,
    });
  };

  private handleChangeTab = (i: number) => {
    this.setState({ activeTab: i });
  };

  private toOptions = () => {
    this.handleChangeTab(COMMON_OPTIONS_INDEX);
  };

  private toDefaultColumnOption = () => {
    this.handleChangeTab(DEFAULT_COLUMN_OPTIONS);
  };

  private addColumn = (selected: SelectableValue<string>) => {
    const i = this.props.options.options.length;

    this.handleChangeTab(i);
    this.props.onOptionsChange({
      ...this.props.options,
      options: [...this.props.options.options, createColumnOption(selected.value as string, this.props.options.defaultColumnOption)],
    });
  };

  private isActive(state: number) {
    return this.state.activeTab === state;
  }

  public render() {
    const { options } = this.props;
    const isColumnOptionActive = this.state.activeTab >= DEFAULT_COLUMN_OPTIONS;
    const isDefaultColumn = this.state.activeTab === DEFAULT_COLUMN_OPTIONS;
    const columnOption = options.options[this.state.activeTab];
    const { labels, columns } = Editor.getColumnsAndLabels(this.props.data); // TODO add memoize
    const restColumns = columns.filter(({ value }) => !options.options.find(({ column: name }) => name === value));

    return (
      <div className="edit-tab-with-sidemenu" style={asideStyle}>
        <aside className="edit-sidemenu-aside">
          <ul className="edit-sidemenu">
            <li key={COMMON_OPTIONS_INDEX} className={cs({ active: this.isActive(COMMON_OPTIONS_INDEX) })}>
              <a onClick={this.toOptions}>
                <h5 className="text-warning">
                  <i className="fa fa-gear" style={optionStyle} />
                  &nbsp; Common
                </h5>
              </a>
            </li>
            <li key={COLUMNS_INDEX}>
              <a onClick={this.toDefaultColumnOption}>
                <h5 className="text-warning">
                  <i className="fa fa-gear" style={optionStyle} />
                  &nbsp; Columns
                </h5>
              </a>
            </li>
            {options.options.map(({ column }, i) => (
              <li key={i} className={cs({ active: this.isActive(i) })}>
                <a onClick={() => this.handleChangeTab(i)}>{column}</a>
              </li>
            ))}
            <li key={DEFAULT_COLUMN_OPTIONS} className={cs({ active: this.isActive(DEFAULT_COLUMN_OPTIONS) })}>
              <a className="pointer" onClick={this.toDefaultColumnOption}>
                Default column
              </a>
            </li>
            <li key={ADD_COLUMN_OPTION_INDEX} style={addColumnStyle}>
              <Select
                isSearchable={false}
                isClearable={false}
                options={restColumns}
                onChange={this.addColumn}
                value={SELECT_VALUE}
                noOptionsMessage={COLUMN_SELECT_NO_OPTION}
              />
            </li>
          </ul>
        </aside>
        <ColumnOptionComponent
          labels={labels}
          visible={isColumnOptionActive}
          option={columnOption || options.defaultColumnOption}
          isDefault={isDefaultColumn}
          onChange={this.handleColumnChange}
          onCopy={this.handleOptionCopy}
          onDelete={this.handleOptionDelete}
          restColumns={restColumns}
        />
        <CommonOptions
          visible={!isColumnOptionActive}
          options={options}
          onChange={this.handleOptionChange}
          loading={this.props.data.state === LoadingState.NotStarted}
          labels={labels}
        />
      </div>
    );
  }
}
