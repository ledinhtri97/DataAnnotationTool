import React from 'react';
import MaterialTable from 'material-table';

export default function MaterialTableSubmitted() {
    const [state, setState] = React.useState({
        columns: [
            { title: 'Thumbnail', field: 'thumb' },
            { title: 'Meta Id', field: 'metaid' },
            { title: 'Last Date Update', field: 'lastDayUpdate', type: 'datetime' },
            { title: 'Labeled Count', field: 'labeledCount', type: 'numeric'},
        ],
        data: [
            { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
            {
                name: 'Zerya Betül',
                surname: 'Baran',
                birthYear: 2017,
                birthCity: 34,
            },
        ],
    });

  return (
    <MaterialTable
      title="Data Annotation Tool - GVLab"
      columns={state.columns}
      data={state.data}
      actions={[
          {
                icon: 'edit',
                tooltip: 'View Before Edit',
                onClick: (event, rowData) => alert("You saved " + rowData.name)
          }
        ]}
    />
  );
}