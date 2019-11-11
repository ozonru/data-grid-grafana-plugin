import cs from 'classnames';
import React, { ChangeEventHandler, Component } from 'react';

type Props = {
  label: string;
  labelWidth: number;
  selectWidth: number;
  value?: string;
  onChange: ChangeEventHandler;
  options: Array<{ key?: number | string; value: string; label?: string }>;
};

export default class FormSelect extends Component<Props> {
  public render() {
    const { label, labelWidth, selectWidth, value, onChange, options } = this.props;

    return [
      <label key="label" className={cs(['gf-form-label', `width-${labelWidth}`])}>
        {label}
      </label>,
      <select key="select" className={cs(['gf-form-input', `width-${selectWidth}`])} onChange={onChange}>
        {options.map(option => (
          <option key={option.key || option.value} value={option.value} selected={option.value === value}>
            {option.label || option.value}
          </option>
        ))}
      </select>,
    ];
  }
}
