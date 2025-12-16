import { Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup.component';
import { NoteComponent } from './components/note/note.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path:'', component:SignupComponent
    },
    {
        path: 'notes', component: DashboardComponent
    },
    {
        path: 'dashboard', component: DashboardComponent
    },
    {
        path:'login',component: LoginComponent
    }
];
