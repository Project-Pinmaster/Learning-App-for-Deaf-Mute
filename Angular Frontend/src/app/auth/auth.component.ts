import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  protected mode = signal<'login' | 'register'>('login');
  protected userType = signal<'normal' | 'handicap'>('normal');
  protected handicapType = signal<'deaf' | 'mute' | 'both'>('deaf');
  protected floatingImages = signal<string[]>([]);
  protected errorMessage = signal<string | null>(null);
  protected errorScope = signal<'login' | 'register' | null>(null);

  protected loginEmail = '';
  protected loginPassword = '';
  protected registerName = '';
  protected registerEmail = '';
  protected registerPassword = '';
  protected registerConfirm = '';

  private readonly baseUrl = 'http://localhost:5000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.route.queryParamMap.subscribe(params => {
      const next = params.get('mode');
      if (next === 'register') {
        this.mode.set('register');
      } else if (next === 'login') {
        this.mode.set('login');
      }
    });

    const images = [
      '/images/flying-img1.png',
      '/images/flying-img2.png',
      '/images/flying-img3.png',
      '/images/flying-img4.png',
      '/images/flying-img5.png',
      '/images/flying-img6.png',
      '/images/flying-img7.png'
    ];

    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.floatingImages.set(shuffled.slice(0, 6));
  }

  protected setMode(next: 'login' | 'register') {
    this.mode.set(next);
    this.errorMessage.set(null);
    this.errorScope.set(null);
  }

  protected setUserType(next: 'normal' | 'handicap') {
    this.userType.set(next);
  }

  protected setHandicapType(next: 'deaf' | 'mute' | 'both') {
    this.handicapType.set(next);
  }

  protected onLogin() {
    this.errorMessage.set(null);
    this.errorScope.set('login');
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.http
      .post<any>(`${this.baseUrl}/api/auth/login`, {
        email: this.loginEmail,
        password: this.loginPassword,
        userType: this.userType(),
      })
      .subscribe({
        next: (res) => {
          if (!res?._id) {
            this.errorMessage.set(res?.message || 'Login failed. Please try again.');
            return;
          }
          localStorage.setItem('userId', res._id);
          localStorage.setItem('fullName', res.fullName);
          localStorage.setItem('userType', res.userType);
          const target = res.userType === 'handicap' ? '/handicap-profile' : '/user-profile';
          this.router.navigate([target]);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Login failed. Please try again.');
        }
      });
  }

  protected onRegister() {
    this.errorMessage.set(null);
    this.errorScope.set('register');
    if (this.registerPassword !== this.registerConfirm) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.http
      .post<any>(`${this.baseUrl}/api/auth/register`, {
        fullName: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        userType: this.userType(),
      })
      .subscribe({
        next: (res) => {
          if (!res?._id) {
            this.errorMessage.set(res?.message || 'Registration failed. Please try again.');
            return;
          }
          localStorage.setItem('userId', res._id);
          localStorage.setItem('fullName', res.fullName);
          localStorage.setItem('userType', res.userType);
          const target = res.userType === 'handicap' ? '/handicap-profile' : '/user-profile';
          this.router.navigate([target]);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
        }
      });
  }
}
