import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonToggleModule, ReactiveFormsModule,FormsModule,MatButtonModule,
    CommonModule, RouterModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private router: Router, private userService: UserService) {
    this.signupForm = new FormGroup({
      firstName: new FormControl('',[Validators.required,Validators.minLength(2)]),
      lastName: new FormControl('',[Validators.required,Validators.minLength(2)]),
      email: new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',[Validators.required,Validators.minLength(4)]),
      role: new FormControl('user',[Validators.required])
    });
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get role() { return this.signupForm.get('role'); }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const payload = this.signupForm.value;
    // Try to persist via UserService, then navigate to login
    this.userService.create(payload).subscribe({
      next: (res) => {
        console.log('User created', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Create user failed', err);
        // Still navigate to login to allow user to try login or contact support
        this.router.navigate(['/login']);
      }
    });
  }
}
