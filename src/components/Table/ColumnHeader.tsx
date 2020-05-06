import React from 'react';
import { Tooltip } from '@grafana/ui';
import { SortDirectionType, SortIndicator } from 'react-virtualized';

interface Props {
  sorting: boolean;
  sortDirection?: SortDirectionType;
  text: string;
  style: any;
  onClick: () => void;
}

export const ColumnHeader: React.FC<Props> = function({ sortDirection, style, sorting, onClick, text }) {
  return (
    <Tooltip content={text}>
      <div className="gf-table-header-custom" style={style} onClick={onClick}>
        {text}
        {sorting && <SortIndicator sortDirection={sortDirection} />}
      </div>
    </Tooltip>
  );
};
