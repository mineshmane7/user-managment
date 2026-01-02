import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DropdownModule } from 'carbon-components-angular';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoteService, Note } from '../../services/note.service';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <--- important
})
export class EditUserComponent {
  // form: FormGroup;
  user: User;

items:any=[]

  selected?: any;

  onRoleChange(event: any) {
    this.selected = event.item;
  }
  constructor(
    private userService: UserService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {

      this.items = [
    { content: 'Admin', selected: true },
    { content: 'Editor', selected: false },
    { content: 'Viewer', selected: false },
  ];
    this.user = data.user;
    // this.form = new FormGroup({
    //   role: new FormControl(this.user?.role || '', [
    //     Validators.required,
    //     Validators.minLength(1),
    //   ]),
    //   name: new FormControl(this.user?.firstName + +this.user.lastName || ''),
    //   manageUser: new FormControl(this.user?.canManageNotes || '', [
    //     Validators.required,
    //     Validators.minLength(1),
    //   ]),
    // });
  }

  save() {
    if (this.selected) return;
    const payload: Partial<User> = {
      role:this.selected.content
 
    };
    const id = this.user.id as number;
    this.userService.update(id, payload).subscribe(
      () => {
        this.snack.open('Note updated', 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      (err) => {
        this.snack.open('Update failed', 'Close', { duration: 3000 });
      }
    );
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
