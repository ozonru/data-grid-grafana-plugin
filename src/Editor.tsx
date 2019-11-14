import cs from 'classnames';
import React, { PureComponent } from 'react';
import { PanelData, PanelEditorProps, Select } from '@grafana/ui';

import Template from './components/ColumnTemplate';
import CommonOptions from './components/CommonOptions';
import { ColumnTemplate, Options } from './types';
import { ADD_TEMPLATE_INDEX, DEFAULT_COLUMN_TEMPLATE, COMMON_OPTIONS_INDEX, TEMPLATE_INDEX } from './consts';
import { LoadingState, SelectableValue } from '@grafana/data';

type EditorState = {
  activeTab: number;
};

function createTemplate(name: string, defaultColumn: ColumnTemplate): ColumnTemplate {
  return {
    ...defaultColumn,
    name,
  };
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

export default class Editor extends PureComponent<PanelEditorProps<Options>, EditorState> {
  public static getColumnsAndLabels(data: PanelData): { labels: string[]; columns: SelectableValue<string>[] } {
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

      if (serie.labels) {
        Object.keys(serie.labels).forEach(label => labels.add(label));
      }
    }

    return { labels: Array.from(labels), columns: Array.from(columns).map(cl => ({ value: cl, label: cl })) };
  }

  public ds: any;

  constructor(props, ctx) {
    super(props, ctx);

    this.state = {
      activeTab: COMMON_OPTIONS_INDEX,
    };
  }

  private handleTemplateChange = (newTemplate: ColumnTemplate) => {
    const templates = this.props.options.templates.slice();

    templates[this.state.activeTab] = newTemplate;
    this.props.onOptionsChange({ ...this.props.options, templates });
  };

  private handleOptionChange = (options: Omit<Options, 'templates'>) => {
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

  private toDefaultTemplate = () => {
    this.handleChangeTab(DEFAULT_COLUMN_TEMPLATE);
  };

  private addColumn = (selected: SelectableValue<string>) => {
    const i = this.props.options.templates.length;

    this.handleChangeTab(i);
    this.props.onOptionsChange({
      ...this.props.options,
      templates: [...this.props.options.templates, createTemplate(selected.value as string, this.props.options.defaultTemplate)],
    });
  };

  private isActive(state: number) {
    return this.state.activeTab === state;
  }

  public render() {
    const { options } = this.props;
    const isTemplateActive = this.state.activeTab >= DEFAULT_COLUMN_TEMPLATE;
    const isDefaultTemplate = this.state.activeTab === DEFAULT_COLUMN_TEMPLATE;
    const template = options.templates[this.state.activeTab];
    const { labels, columns } = Editor.getColumnsAndLabels(this.props.data); // TODO add memoize

    return (
      <div className="edit-tab-with-sidemenu" style={asideStyle}>
        <aside className="edit-sidemenu-aside">
          <ul className="edit-sidemenu">
            <li key={TEMPLATE_INDEX}>
              <a href="#">
                <h5 className="text-warning">
                  <i className="fa fa-gear" style={optionStyle} />
                  &nbsp; Column Templates
                </h5>
              </a>
            </li>
            {options.templates.map(({ name }, i) => (
              <li key={i} className={cs({ active: this.isActive(i) })}>
                <a onClick={() => this.handleChangeTab(i)}>{name}</a>
              </li>
            ))}
            <li key={DEFAULT_COLUMN_TEMPLATE} className={cs({ active: this.isActive(DEFAULT_COLUMN_TEMPLATE) })}>
              <a className="pointer" onClick={this.toDefaultTemplate}>
                Default column
              </a>
            </li>
            <li key={ADD_TEMPLATE_INDEX} style={addColumnStyle}>
              <Select isSearchable={false} isClearable={false} options={columns} onChange={this.addColumn} value={SELECT_VALUE} />
            </li>
            <li key={COMMON_OPTIONS_INDEX} className={cs({ active: this.isActive(COMMON_OPTIONS_INDEX) })}>
              <a onClick={this.toOptions}>
                <h5 className="text-warning">
                  <i className="fa fa-gear" style={optionStyle} />
                  &nbsp; Common Options
                </h5>
              </a>
            </li>
          </ul>
        </aside>
        <Template
          visible={isTemplateActive}
          template={template || options.defaultTemplate}
          isDefault={isDefaultTemplate}
          onChange={this.handleTemplateChange}
        />
        <CommonOptions
          visible={!isTemplateActive}
          options={options}
          onChange={this.handleOptionChange}
          loading={this.props.data.state === LoadingState.NotStarted}
          labels={labels}
        />
      </div>
    );
  }
}
