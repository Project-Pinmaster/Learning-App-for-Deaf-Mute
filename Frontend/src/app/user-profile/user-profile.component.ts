import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { ProgressService, UserProgress } from '../services/progress.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  protected fullName = signal<string>('User');
  protected progress = signal<UserProgress | null>(null);
  protected menuOpen = signal(false);

  constructor(private progressService: ProgressService, private router: Router) {
    const storedName = localStorage.getItem('fullName');
    if (storedName) {
      this.fullName.set(storedName);
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.progressService.getUserProgress(userId).subscribe((res) => {
        this.progress.set(res.progress);
      });
    }
  }

  protected toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  protected goToHowItWorks() {
    this.menuOpen.set(false);
    this.router.navigate(['/how-it-works']);
  }

  protected goToSettings() {
    this.menuOpen.set(false);
    this.router.navigate(['/settings']);
  }

  protected logout() {
    this.menuOpen.set(false);
    localStorage.clear();
    this.router.navigate(['/']);
  }
}