import { Component, Input } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import {
  ButtonModule,
  ListModule,
  TableModule,
  InputModule,
  TableModel,
  TableHeaderItem,
  TableItem,
} from 'carbon-components-angular';

@Component({
  selector: 'app-table',
  imports: [TableModule, ButtonModule, ListModule, InputModule, MatInputModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() inputFromParent: any;
  searchString = '';

  model = new TableModel();

  constructor() {}

  ngOnInit() {
    console.log(this.inputFromParent);
    this.model.header = [
      new TableHeaderItem({ data: 'ID' }),
      new TableHeaderItem({ data: 'Name' }),
      new TableHeaderItem({ data: 'Email' }),
      new TableHeaderItem({ data: 'Role' }),
      new TableHeaderItem({ data: 'Edit role' }),
      new TableHeaderItem({ data: 'Delete Role' }),
      new TableHeaderItem({ data: 'Manage Note' }),
    ];
    this.updateTable(this.inputFromParent);
  }

  updateTable(data: any[]) {
    this.model.data = data.map((item: any) => [
      new TableItem({ data: item.id }),
      new TableItem({ data: item?.firstName + ' ' + item?.lastName }),
      new TableItem({ data: item?.email }),
      new TableItem({ data: item?.role }),
      new TableItem({ data: item?.canEditNotes }),
      new TableItem({ data: item?.canDeleteNotes }),
      new TableItem({ data: item?.canManageNotes }),
    ]);
  }

  // onSearch(searchText: string) {
  //   const filtered = this.inputFromParent.filter((item: any) => {
  //     return (
  //       item.lastName.toLocaleLowerCase().includes(searchText) ||
  //       item.firstName.toLocaleLowerCase().includes(searchText)
  //     );
  //   });

  //   this.updateTable(filtered);
  // }
}
