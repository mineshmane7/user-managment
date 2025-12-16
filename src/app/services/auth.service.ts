import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { User, UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadFromStorage());

  constructor(private userService: UserService) {}


  refreshCurrentUser(): Observable<User | null> {
    const cu = this.currentUser;
    if (!cu || !cu.id) return of(null);
    return this.userService.getById(cu.id).pipe(
      tap(fresh => this.saveToStorage(fresh))
    );
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: User | null) {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
    this.currentUserSubject.next(user);
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User | null> {
    return this.userService.getAll().pipe(
      map(users => {
        const user = users.find(u => u.email === email && u.password === password) || null;
        this.saveToStorage(user);
        return user;
      })
    );
  }

  logout() {
    this.saveToStorage(null);
  }

  isAdmin(): boolean {
    return !!(this.currentUser && this.currentUser.role === 'admin');
  }

  hasNotePermission(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return !!(this.currentUser.canManageNotes);
  }

  hasEditPermission(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return !!(this.currentUser.canEditNotes || this.currentUser.canManageNotes);
  }

  hasDeletePermission(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    return !!(this.currentUser.canDeleteNotes || this.currentUser.canManageNotes);
  }
}
