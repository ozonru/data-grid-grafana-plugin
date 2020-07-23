import { PanelPlugin } from '@grafana/data';
import { Options } from './types';
import Panel from './Panel';
import Editor from './Editor';
import { defaults } from './consts';

import './switch-patch.css';

export const plugin = new PanelPlugin<Options>(Panel).setDefaults(defaults).setEditor(Editor);
