import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ProgressService, UserProgress } from '../services/progress.service';

interface Message {
  id: number;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-handicap-profile',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule],
  templateUrl: './handicap-profile.component.html',
  styleUrl: './handicap-profile.component.css'
})
export class HandicapProfileComponent {
  protected fullName = signal<string>('User');
  protected progress = signal<UserProgress | null>(null);
  protected menuOpen = signal(false);
  protected showQuickMessages = signal(false);
  protected selectedMessage = signal<string>('');

  protected quickMessages: Message[] = [
    { id: 1, text: 'Hello', icon: '👋' },
    { id: 2, text: 'How are you?', icon: '😊' },
    { id: 3, text: 'Thank you', icon: '🙏' },
    { id: 4, text: 'Good morning', icon: '🌅' },
    { id: 5, text: 'Good night', icon: '🌙' },
    { id: 6, text: 'Nice to meet you', icon: '🤝' },
    { id: 7, text: 'I need help', icon: '🆘' },
    { id: 8, text: 'What time is it?', icon: '⏰' },
    { id: 9, text: 'Where is the bathroom?', icon: '🚽' },
    { id: 10, text: 'Excuse me', icon: '☝️' },
    { id: 11, text: 'I do not understand', icon: '🤔' },
    { id: 12, text: 'Please repeat', icon: '🔄' }
  ];

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

  protected toggleQuickMessages() {
    this.showQuickMessages.set(!this.showQuickMessages());
  }

  protected selectMessage(message: Message) {
    this.selectedMessage.set(message.text);
    // Copy to clipboard
    navigator.clipboard.writeText(message.text).then(() => {
      alert(`Copied: "${message.text}" to clipboard`);
      this.showQuickMessages.set(false);
    });
  }

  protected closeQuickMessages() {
    this.showQuickMessages.set(false);
  }
}
