import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoteService, Note } from '../../services/note.service';

@Component({
  selector: 'app-note-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent {
  form: FormGroup;
  note: Note;

  constructor(
    private noteService: NoteService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<NoteEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { note: Note }
  ) {
    this.note = data.note;
    this.form = new FormGroup({
      title: new FormControl(this.note?.title || '', [Validators.required, Validators.minLength(1)]),
      content: new FormControl(this.note?.content || '', [Validators.required, Validators.minLength(1)])
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload: Partial<Note> = {
      title: this.form.value.title,
      content: this.form.value.content
    };
    const id = this.note.id as number;
    this.noteService.update(id, payload).subscribe(() => {
      this.snack.open('Note updated', 'Close', { duration: 2000 });
      this.dialogRef.close(true);
    }, err => {
      this.snack.open('Update failed', 'Close', { duration: 3000 });
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
