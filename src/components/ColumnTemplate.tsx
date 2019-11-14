import React, { ChangeEventHandler, Component } from 'react';
import { ColumnTemplate as IColumnTemplate, StatType } from 'types';
import { FormField } from '@grafana/ui';
import FormSelect from './FormSelect';
import { FORM_ELEMENT_WIDTH, LABEL_WIDTH } from '../consts';
import EditorTab from './EditorTab';

interface Props {
  visible?: boolean;
  isDefault: boolean;
  template: IColumnTemplate;
  onChange: (template: IColumnTemplate) => void;
}

const TYPE_SELECT_OPTIONS: { value: string }[] = [
  { value: StatType.Avg },
  { value: StatType.Max },
  { value: StatType.Min },
  { value: StatType.Total },
];

function handleChange<T extends keyof IColumnTemplate>(this: Component<Props>, key: T, value: React.SyntheticEvent) {
  this.props.onChange({
    ...this.props.template,
    // @ts-ignore
    [key]: value.target.value,
  });
}

export default class ColumnTemplate extends Component<Props> {
  constructor(props, ctx) {
    super(props, ctx);

    // this.handleColumnsChange = handleChange.bind<Component<Props>, keyof IColumnTemplate, any, void>(this, 'columns');
    this.handleStatChange = handleChange.bind<Component<Props>, keyof IColumnTemplate, any, void>(this, 'type');
    this.handleNameChange = handleChange.bind<Component<Props>, keyof IColumnTemplate, any, void>(this, 'name');
    this.handleDelimiterChange = handleChange.bind<Component<Props>, keyof IColumnTemplate, any, void>(this, 'delimiter');
  }

  private handleNameChange!: ChangeEventHandler;
  private handleStatChange!: ChangeEventHandler;
  // private handleColumnsChange!: ChangeEventHandler;
  private handleDelimiterChange!: ChangeEventHandler;

  public render() {
    const { template, isDefault, visible } = this.props;

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
              <div className="gr-form-inline">
                <div className="gf-form">
                  <FormField
                    label="Name of the template"
                    labelWidth={LABEL_WIDTH}
                    inputWidth={FORM_ELEMENT_WIDTH}
                    type="text"
                    onChange={this.handleNameChange}
                    value={template.name}
                  />
                  <span className="split"></span>
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
                  labelWidth={LABEL_WIDTH}
                  inputWidth={FORM_ELEMENT_WIDTH}
                  type="number"
                  onChange={this.handleDelimiterChange}
                  value={template.delimiter}
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
                  value={template.type}
                />
              </div>
            </div>
          </div>
        </div>
      </EditorTab>
    );
  }
}
