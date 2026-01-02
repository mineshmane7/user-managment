import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoteEditComponent } from '../note-edit/note-edit.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    ButtonModule,
    ListModule,
    InputModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnChanges {
  @Input() inputFromParent: any;
  @Output() messageEvent = new EventEmitter<any>();

  searchString = '';
  @ViewChild('actionTemplate') actionTemplate!: TemplateRef<any>;
  model = new TableModel();

  isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private snack: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.inputFromParent);

    if (changes['inputFromParent']) {
      this.updateTable(changes['inputFromParent'].currentValue);
    }
  }

  ngOnInit() {
    console.log(this.inputFromParent);
    this.isBrowser = isPlatformBrowser(this.platformId);

    console.log(this.inputFromParent);
    if (this.isBrowser) {
      this.model.header = [
        new TableHeaderItem({ data: 'ID' }),
        new TableHeaderItem({ data: 'Name' }),
        new TableHeaderItem({ data: 'Email' }),
        new TableHeaderItem({ data: 'Role' }),
        new TableHeaderItem({ data: 'Edit role' }),
        new TableHeaderItem({ data: 'Delete Role' }),
        new TableHeaderItem({ data: 'Manage Note' }),
        new TableHeaderItem({ data: 'Action', sortable: false }),
      ];
      this.updateTable(this.inputFromParent);
    }
  }
  ngAfterViewInit() {
    this.updateTable(this.inputFromParent);
  }

  sendMessage(row: number) {
    this.deleteUser(row);
  }
  deleteUser(id: number) {
    if (!id) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.inputFromParent = this.inputFromParent.filter(
          (user: any) => user.id !== id
        );
        this.messageEvent.emit();

        this.updateTable(this.inputFromParent);

        // console.log(this.inputFromParent);

        this.snack.open('User deleted', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.snack.open('Delete failed', 'Close', { duration: 3000 });
      },
    });
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
      new TableItem({
        template: this.actionTemplate,
        data: item,
      }),
    ]);
  }
  edit(row: any) {
    console.log(row);
    if (!row || row.id == null) return;
    const ref = this.dialog.open(EditUserComponent, {
      width: '640px',
      data: { user: row },
    });
    ref.afterClosed().subscribe((res) => {
      if (res)  {
        console.log("record updated");  
      }

    });
  }
  onSearch(e: any) {
    const searchText = e.target.value;
    const filtered = this.inputFromParent.filter((item: any) => {
      return (
        item.lastName.toLocaleLowerCase().includes(searchText) ||
        item.firstName.toLocaleLowerCase().includes(searchText)
      );
    });

    this.updateTable(filtered);
  }
}
