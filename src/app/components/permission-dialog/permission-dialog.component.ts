import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { User } from '../../services/user.service';

export interface PermissionDialogData {
  user: User;
}

@Component({
  selector: 'app-permission-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './permission-dialog.component.html',
  styleUrls: ['./permission-dialog.component.scss']
})
export class PermissionDialogComponent {
  canEdit = false;
  canDelete = false;

  constructor(
    private dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionDialogData
  ) {
    const u = data?.user;
    this.canEdit = !!(u && ((u as any).canEditNotes ?? (u.canManageNotes ?? false)));
    this.canDelete = !!(u && ((u as any).canDeleteNotes ?? (u.canManageNotes ?? false)));
  }

  save() {
    this.dialogRef.close({ canEdit: this.canEdit, canDelete: this.canDelete });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
