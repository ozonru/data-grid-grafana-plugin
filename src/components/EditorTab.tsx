import React, { FunctionComponent } from 'react';

const EditorTab: FunctionComponent<{ visible?: boolean; children: any }> = ({ visible, children }) => (
  <div className="edit-tab-content" style={visible ? undefined : { display: 'none' }}>
    {children}
  </div>
);

export default EditorTab;
