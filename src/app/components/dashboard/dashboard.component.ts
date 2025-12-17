import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  ButtonModule,
  ListModule,
  TableModule,
  TabsModule,
  InputModule
} from 'carbon-components-angular';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoteEditComponent } from '../note-edit/note-edit.component';
import { PermissionDialogComponent } from '../permission-dialog/permission-dialog.component';
import { NoteService, Note } from '../../services/note.service';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
// import { SearchPipe } from '../../pipe/search.pipe';
import * as Papa from 'papaparse';
import { TableComponent } from "../table/table.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    // SearchPipe,
    InputModule,
    TabsModule,
    ListModule,
    TableComponent,
    ButtonModule
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  csvData: any[] = [];
  searchString = '';
  notes: Note[] = [];
  users: User[] = [];
  editingNoteId: number | null = null;
  editingUserId: number | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  showCreateForm = false;
  newNoteTitle = '';
  newNoteContent = '';
  // Maps to hold inline edit values so ngModel can bind to a simple property
  _editTitleMap: Record<string, string> = {};
  _editContentMap: Record<string, string> = {};
  _editFirstNameMap: Record<string, string> = {};
  _editLastNameMap: Record<string, string> = {};
  _editEmailMap: Record<string, string> = {};
  _editRoleMap: Record<string, string> = {};
  _editAccessMap: Record<string, boolean> = {};

  constructor(
    public auth: AuthService,
    private noteService: NoteService,
    private userService: UserService,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loadAll();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  loadAll() {
    this.noteService.getAll().subscribe((n) => (this.notes = n));
    this.userService.getAll().subscribe((u) => (this.users = u));
  }

  toggleCreateForm(show?: boolean) {
    this.showCreateForm =
      typeof show === 'boolean' ? show : !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newNoteTitle = '';
      this.newNoteContent = '';
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.csvData = result.data;
        console.log(this.csvData);
        this.saveUsers();
      },
    });
  }

  saveUsers() {
    this.csvData.forEach((user) => {
      this.userService.create(user).subscribe({
        next: () => {
          console.log('User added:', user), this.loadAll();
          this.snack.open('Note created', 'Close', { duration: 2000 });
        },
        error: (err) => console.error('Error adding user', err),
      });
    });
  }

  createNote() {
    const payload: Partial<Note> = {
      title: this.newNoteTitle.trim(),
      content: this.newNoteContent.trim(),
      createdAt: new Date().toISOString(),
    };
    if (!payload.title || !payload.content) {
      this.snack.open('Title and content are required', 'Close', {
        duration: 2000,
      });
      return;
    }
    this.noteService.create(payload as Note).subscribe(
      () => {
        this.snack.open('Note created', 'Close', { duration: 2000 });
        this.toggleCreateForm(false);
        this.loadAll();
      },
      () => this.snack.open('Create failed', 'Close', { duration: 3000 })
    );
  }

  saveNote(n: Note) {
    const id = n.id as number;
    const k = String(id);
    const updated: Partial<Note> = {
      title: this._editTitleMap[k],
      content: this._editContentMap[k],
    };
    this.noteService.update(id, updated).subscribe(
      () => {
        this.snack.open('Note updated', 'Close', { duration: 2000 });
        // clean up temp edit maps
        delete this._editTitleMap[k];
        delete this._editContentMap[k];
        this.editingNoteId = null;
        this.loadAll();
      },
      (err) => {
        this.snack.open('Update failed', 'Close', { duration: 3000 });
      }
    );
  }

  cancelEditNote(n: Note) {
    this.editingNoteId = null;
    if (n.id != null) {
      const k = String(n.id);
      delete this._editTitleMap[k];
      delete this._editContentMap[k];
    }
  }

  deleteNote(id?: number) {
    if (!id) return;
    this.noteService.delete(id).subscribe(
      () => {
        this.snack.open('Note deleted', 'Close', { duration: 2000 });
        this.loadAll();
      },
      () => this.snack.open('Delete failed', 'Close', { duration: 3000 })
    );
  }

  startEditUser(u: User) {
    this.editingUserId = u.id || null;
    if (u.id != null) {
      const k = String(u.id);
      this._editFirstNameMap[k] = u.firstName;
      this._editLastNameMap[k] = u.lastName;
      this._editEmailMap[k] = u.email;
      this._editRoleMap[k] = u.role || 'user';
      this._editAccessMap[k] = !!u.canManageNotes;
    }
  }

  saveUser(u: User) {
    const id = u.id as number;
    const k = String(id);
    const updated: Partial<User> = {
      firstName: this._editFirstNameMap[k],
      lastName: this._editLastNameMap[k],
      email: this._editEmailMap[k],
      role: this._editRoleMap[k],
      canManageNotes: !!this._editAccessMap[k],
    };
    this.userService.update(id, updated).subscribe(
      () => {
        this.snack.open('User updated', 'Close', { duration: 2000 });
        this.editingUserId = null;
        this.loadAll();
      },
      () => this.snack.open('Update failed', 'Close', { duration: 3000 })
    );
  }

  cancelEditUser(u: User) {
    this.editingUserId = null;
    if (u.id != null) {
      const k = String(u.id);
      delete this._editFirstNameMap[k];
      delete this._editLastNameMap[k];
      delete this._editEmailMap[k];
    }
  }

  setViewMode(m: 'grid' | 'list') {
    this.viewMode = m;
    this.editingNoteId = null;
  }

  startEditNote(n: Note) {
    if (!n || n.id == null) return;
    const ref = this.dialog.open(NoteEditComponent, {
      width: '640px',
      data: { note: n },
    });
    ref.afterClosed().subscribe((res) => {
      if (res) this.loadAll();
    });
  }

  deleteUser(id?: number) {
    if (!id) return;
    this.userService.delete(id).subscribe(
      () => {
        this.snack.open('User deleted', 'Close', { duration: 2000 });
        this.loadAll();
      },
      () => this.snack.open('Delete failed', 'Close', { duration: 3000 })
    );
  }

  togglePermission(u: User) {
    if (!u.id) return;
    const ref = this.dialog.open(PermissionDialogComponent, {
      width: '420px',
      data: { user: u },
    });
    ref.afterClosed().subscribe((res) => {
      if (!res) return; // cancelled
      const updated: any = {};
      updated.canEditNotes = !!res.canEdit;
      updated.canDeleteNotes = !!res.canDelete;
      updated.canManageNotes = !!(res.canEdit || res.canDelete);
      this.userService.update(u.id as number, updated).subscribe(
        () => {
          this.snack.open('Permissions updated', 'Close', { duration: 2000 });
          this.loadAll();
        },
        () =>
          this.snack.open('Failed to update permission', 'Close', {
            duration: 3000,
          })
      );
    });
  }

  getNoteKey(n: Note): string {
    return n && n.id != null ? String(n.id) : '';
  }

  getUserKey(u: User): string {
    return u && u.id != null ? String(u.id) : '';
  }

  getUserInitials(): string {
    const u = this.auth.currentUser;
    if (!u) return '';
    const f = (u.firstName || '').trim();
    const l = (u.lastName || '').trim();
    const initials = (f[0] || '').toUpperCase() + (l[0] || '').toUpperCase();
    return initials || (u.email ? u.email[0].toUpperCase() : '');
  }
}
