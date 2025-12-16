import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoteService, Note } from '../../services/note.service';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatSnackBarModule,
  ],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  notes: Note[] = [];
  users: User[] = [];
  form: FormGroup;
  editingId: number | null = null;

  constructor(private noteService: NoteService, public auth: AuthService, private snack: MatSnackBar, private userService: UserService) {
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(1)]),
      content: new FormControl('', [ Validators.minLength(1)])
    });

    this.load();
    if (this.auth.isAdmin()) {
      this.userService.getAll().subscribe(u => this.users = u);
    }
  }

  load() {
    this.noteService.getAll().subscribe(n => this.notes = n);
  }

  canManage(): boolean {
    return this.auth.hasNotePermission();
  }

  submit() {
    if (!this.canManage()) {
      this.snack.open('You do not have permission to manage notes', 'Close', { duration: 3000 });
      return;
    }
    if (this.form.invalid) return;

    const payload: Note = {
      title: this.form.value.title,
      content: this.form.value.content,
      authorId: this.auth.currentUser?.id,
      createdAt: new Date().toISOString()
    };

    if (this.editingId) {
      this.noteService.update(this.editingId, payload).subscribe(() => {
        this.snack.open('Note updated', 'Close', { duration: 2000 });
        this.form.reset(); this.editingId = null; this.load();
      });
    } else {
      this.noteService.create(payload).subscribe(() => {
        this.snack.open('Note created', 'Close', { duration: 2000 });
        this.form.reset(); this.load();
      });
    }
  }

  edit(note: Note) {
    if (!this.canManage()) return;
    this.editingId = note.id || null;
    this.form.patchValue({ title: note.title, content: note.content });
  }

  remove(note: Note) {
    if (!this.canManage()) {
      this.snack.open('You do not have permission to delete notes', 'Close', { duration: 3000 });
      return;
    }
    if (!note.id) return;
    this.noteService.delete(note.id).subscribe(() => { this.snack.open('Note deleted', 'Close', { duration: 2000 }); this.load(); });
  }

  // Admin-only: toggle user's canManageNotes flag
  togglePermission(user: User) {
    if (!this.auth.isAdmin()) return;
    const updated = { ...user, canManageNotes: !user.canManageNotes };
    this.userService.update(user.id as number, updated).subscribe((u) => {
      this.snack.open(`Updated ${u.firstName}'s permissions`, 'Close', { duration: 2000 });
      // refresh users
      this.userService.getAll().subscribe(list => this.users = list);
    });
  }
}
