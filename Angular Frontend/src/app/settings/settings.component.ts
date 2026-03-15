import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  protected email = signal('');
  protected fullName = signal('');
  protected currentPassword = signal('');
  protected newPassword = signal('');
  protected confirmPassword = signal('');
  protected message = signal<string | null>(null);
  protected error = signal<string | null>(null);

  private readonly baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      this.fullName.set(storedName);
    }
  }

  protected updateEmail() {
    this.message.set(null);
    this.error.set(null);
    if (!this.email()) {
      this.error.set('Please enter a new email address.');
      return;
    }
    if (!confirm('Are you sure you want to change your email?')) {
      return;
    }
    const userId = localStorage.getItem('userId');
    this.http.post<any>(`${this.baseUrl}/api/users/change-email`, {
      userId,
      email: this.email(),
    }).subscribe({
      next: (res) => {
        if (res?.success) {
          this.message.set('Email updated successfully.');
        } else {
          this.error.set(res?.message || 'Unable to update email.');
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to update email.');
      }
    });
  }

  protected updateName() {
    this.message.set(null);
    this.error.set(null);
    if (!this.fullName()) {
      this.error.set('Please enter a new name.');
      return;
    }
    const userId = localStorage.getItem('userId');
    this.http.post<any>(`${this.baseUrl}/api/users/change-name`, {
      userId,
      fullName: this.fullName(),
    }).subscribe({
      next: (res) => {
        if (res?.success) {
          localStorage.setItem('fullName', this.fullName());
          this.message.set('Name updated successfully.');
        } else {
          this.error.set(res?.message || 'Unable to update name.');
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to update name.');
      }
    });
  }

  protected updatePassword() {
    this.message.set(null);
    this.error.set(null);
    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.error.set('Please fill all password fields.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('New passwords do not match.');
      return;
    }
    const userId = localStorage.getItem('userId');
    this.http.post<any>(`${this.baseUrl}/api/users/change-password`, {
      userId,
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword(),
    }).subscribe({
      next: (res) => {
        if (res?.success) {
          this.message.set('Password updated successfully.');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
        } else {
          this.error.set(res?.message || 'Unable to update password.');
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to update password.');
      }
    });
  }

  protected backToProfile() {
    const userType = localStorage.getItem('userType');
    const target = userType === 'handicap' ? '/handicap-profile' : '/user-profile';
    this.router.navigate([target]);
  }
}
