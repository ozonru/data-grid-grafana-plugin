import cs from 'classnames';
import React, { PureComponent } from 'react';
import { PanelData, PanelEditorProps } from '@grafana/ui';

import Template from './components/ColumnTemplate';
import CommonOptions from './components/CommonOptions';
import { ColumnTemplate, Options, StatType } from './types';
import { ADD_TEMPLATE_INDEX, COMMON_OPTIONS_INDEX, TEMPLATE_INDEX } from './consts';
import { LoadingState } from '@grafana/data';

type EditorState = {
  activeTab: number;
};

function createTemplate(i: number): ColumnTemplate {
  return {
    columns: [],
    delimiter: 2,
    name: `Template #${i}`,
    type: StatType.Total,
  };
}

const optionStyle = { marginRight: '7px' };

export default class Editor extends PureComponent<PanelEditorProps<Options>, EditorState> {
  public static getLabelsFromSeriesRequest(data: PanelData): string[] {
    if (data.series.length === 0) {
      return [];
    }

    const labels = new Set<string>();

    data.series.forEach(serie => Object.keys(serie.labels || {}).forEach(label => labels.add(label)));

    return Array.from(labels);
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

  private addColumn = () => {
    const i = this.props.options.templates.length;

    this.handleChangeTab(i);
    this.props.onOptionsChange({
      ...this.props.options,
      templates: [...this.props.options.templates, createTemplate(i + 1)],
    });
  };

  private isActive(state: number) {
    return this.state.activeTab === state;
  }

  public render() {
    const { options } = this.props;
    const isTemplateActive = this.state.activeTab > -1;
    const template = options.templates[this.state.activeTab];

    return (
      <div className="edit-tab-with-sidemenu">
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
            <li key={ADD_TEMPLATE_INDEX}>
              <a className="pointer" onClick={this.addColumn}>
                <i className="fa fa-plus" />
                &nbsp; Add Template
              </a>
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
        {isTemplateActive ? (
          <Template key="template" template={template} onChange={this.handleTemplateChange} />
        ) : (
          <CommonOptions
            key="common"
            options={options}
            onChange={this.handleOptionChange}
            loading={this.props.data.state === LoadingState.NotStarted}
            labels={Editor.getLabelsFromSeriesRequest(this.props.data)}
          />
        )}
      </div>
    );
  }
}
