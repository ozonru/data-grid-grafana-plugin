import React, { Component } from 'react';
import { FormField } from '@grafana/ui';

interface Props<T> {
  label: string;
  labelWidth?: number;
  inputWidth?: number;
  placeholder?: string;
  value: T;
  valueToString: (value: T) => string;
  onChange: (val: string) => void;
}
type State = { value: string; focus: boolean };

export default class InputOnBlur<T> extends Component<Props<T>, State> {
  public static getDerivedStateFromProps<T>(props: Props<T>, state: State): State {
    if (state.focus) {
      return state;
    }

    return {
      focus: false,
      value: props.valueToString(props.value),
    };
  }

  constructor(props: Props<T>, ctx) {
    super(props, ctx);

    this.state = {
      focus: false,
      value: props.valueToString(props.value) || '',
    };
  }

  public shouldComponentUpdate(nextProps: Readonly<Props<T>>, nextState: Readonly<{ value: string }>): boolean {
    return this.state.value !== nextState.value || this.props.value !== nextProps.value;
  }

  private handleFocus = () => {
    this.setState({
      focus: true,
      value: this.state.value,
    });
  };

  private handleBlur = () => {
    this.setState({
      focus: false,
      value: this.state.value,
    });
    this.props.onChange(this.state.value);
  };

  private handleChange = (e: React.SyntheticEvent) => {
    this.setState({
      // @ts-ignore
      value: e.target.value,
    });
  };

  public render() {
    const { label, labelWidth, inputWidth, placeholder } = this.props;

    return (
      <FormField
        type="text"
        label={label}
        placeholder={placeholder}
        labelWidth={labelWidth}
        inputWidth={inputWidth}
        value={this.state.value}
        onFocus={this.handleFocus}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
      />
    );
  }
}
