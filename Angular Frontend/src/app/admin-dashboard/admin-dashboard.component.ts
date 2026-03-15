import { Component, computed, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  userType: 'normal' | 'handicap';
  lessonsCompleted: number;
  progressPercentage: number;
  lastLoginAt: string | null;
};

type Summary = {
  totalUsers: number;
  totalHandicap: number;
  totalNormal: number;
  activeUsers: number;
  totalLessons: number;
  averageLessonsCompleted: number;
  totalCompletedLessons: number;
  activeLearners: number;
};

type Charts = {
  completionRate: number;
  activeUsersSeries: { label: string; count: number }[];
  progressDistribution: { label: string; count: number }[];
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  protected users = signal<UserRow[]>([]);
  protected summary = signal<Summary>({
    totalUsers: 0,
    totalHandicap: 0,
    totalNormal: 0,
    activeUsers: 0,
    totalLessons: 0,
    averageLessonsCompleted: 0,
    totalCompletedLessons: 0,
    activeLearners: 0
  });
  protected charts = signal<Charts>({
    completionRate: 0,
    activeUsersSeries: [],
    progressDistribution: []
  });
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected userTypeFilter = signal<'all' | 'normal' | 'handicap'>('all');
  protected activityFilter = signal<'all' | 'active' | 'inactive'>('all');
  protected progressFilter = signal<'all' | '0-25' | '26-50' | '51-75' | '76-100'>('all');

  private readonly baseUrl = 'http://localhost:5000';
  private readonly activeWindowDays = 7;

  protected filteredUsers = computed(() => {
    const cutoff = this.getCutoffDate();
    return this.users().filter(user => {
      if (this.userTypeFilter() !== 'all' && user.userType !== this.userTypeFilter()) {
        return false;
      }
      if (this.activityFilter() !== 'all') {
        const isActive = user.lastLoginAt ? new Date(user.lastLoginAt) >= cutoff : false;
        if (this.activityFilter() === 'active' && !isActive) return false;
        if (this.activityFilter() === 'inactive' && isActive) return false;
      }
      if (this.progressFilter() !== 'all') {
        const pct = user.progressPercentage ?? 0;
        if (this.progressFilter() === '0-25' && pct > 25) return false;
        if (this.progressFilter() === '26-50' && (pct < 26 || pct > 50)) return false;
        if (this.progressFilter() === '51-75' && (pct < 51 || pct > 75)) return false;
        if (this.progressFilter() === '76-100' && pct < 76) return false;
      }
      return true;
    });
  });

  constructor(private http: HttpClient) {
    this.loadDashboard();
  }

  protected trackById(_: number, item: UserRow) {
    return item._id;
  }

  protected reload() {
    window.location.reload();
  }

  private loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${this.baseUrl}/api/admin/users`).subscribe({
      next: (res) => {
        this.users.set(res?.users ?? []);
      },
      error: () => {
        this.error.set('Unable to load admin users. Is the backend running?');
      }
    });

    this.http.get<any>(`${this.baseUrl}/api/admin/progress`).subscribe({
      next: (res) => {
        if (res?.summary) {
          this.summary.set(res.summary);
        }
        if (res?.charts) {
          this.charts.set(res.charts);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load admin analytics. Is the backend running?');
        this.loading.set(false);
      }
    });
  }

  private getCutoffDate() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.activeWindowDays);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  }
}
