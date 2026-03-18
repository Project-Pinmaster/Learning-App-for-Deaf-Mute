import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService, UserProgress } from '../services/progress.service';

interface Lesson {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  videoUrl?: string;
  captionsUrl?: string;
  duration: string;
}

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent {
  lessons: Lesson[] = [
    {
      id: 1,
      title: 'Alphabet Basics',
      description: 'Learn the ASL alphabet from A to Z.',
      duration: '5 min',
      completed: false,
      videoUrl: '/videos/alphabets.mp4',
      captionsUrl: '/videos/captions/alphabets.vtt'
    },
    {
      id: 2,
      title: 'Common Greetings',
      description: 'Say hello, goodbye, and introduce yourself.',
      duration: '10 min',
      completed: false,
      videoUrl: '/videos/Greetings-Farewells.mp4',
      captionsUrl: '/videos/captions/Greetings-Farewells.vtt'
    },
    {
      id: 3,
      title: 'Numbers 1-10',
      description: 'Learn to count using sign language.',
      duration: '5 min',
      completed: false,
      videoUrl: '/videos/numbers.mp4',
      captionsUrl: '/videos/captions/numbers.vtt'
    },
    {
      id: 4,
      title: 'Family Members',
      description: 'Signs for mother, father, brother, sister, etc.',
      duration: '15 min',
      completed: false,
      videoUrl: '/videos/family-members.mp4',
      captionsUrl: '/videos/captions/family-members.vtt'
    },
    {
      id: 5,
      title: 'Questions & Answers',
      description: 'Who, what, when, where, why, and how.',
      duration: '12 min',
      completed: false,
      videoUrl: '/videos/questions.mp4',
      captionsUrl: '/videos/captions/questions.vtt'
    },
  ];

  selectedLesson: Lesson | null = null;
  protected floatingImages: string[] = [];
  protected progress: UserProgress | null = null;
  protected isLoading = true;
  protected isSaving = false;
  private userId: string | null = null;
  protected isHandicapUser = false;

  constructor(
    private progressService: ProgressService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    const images = [
      '/images/flying-img1-nobg.png',
      '/images/flying-img2-nobg.png',
      '/images/flying-img3-nobg.png',
      '/images/flying-img4-nobg.png',
      '/images/flying-img5-nobg.png',
      '/images/flying-img6-nobg.png',
      '/images/flying-img7-nobg.png',
      '/images/flying-img8-nobg.png',
      '/images/flying-img9-nobg.png',
      '/images/flying-img10-nobg.png',
      '/images/flying-img11-nobg.png',
      '/images/flying-img12-nobg.png'
    ];

    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const floatingCount = 6 + Math.floor(Math.random() * 4);
       this.floatingImages = shuffled.slice(0, floatingCount);

    this.userId = localStorage.getItem('userId');
    this.isHandicapUser = localStorage.getItem('userType') === 'handicap';
    this.loadProgress();
  }

  get progressPercentage() {
    const completed = this.lessons.filter(l => l.completed).length;
    return Math.round((completed / this.lessons.length) * 100);
  }

  openLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
  }

  closeLesson() {
    this.selectedLesson = null;
  }

  markCompleted() {
    if (!this.selectedLesson) {
      return;
    }

    if (this.selectedLesson.completed) {
      this.selectedLesson = null;
      return;
    }

    const lessonTitle = this.selectedLesson.title;
    this.selectedLesson.completed = true;
    this.selectedLesson = null;
    this.isSaving = true;

    if (!this.userId) {
      this.isSaving = false;
      return;
    }

    this.progressService.updateUserProgress(this.userId, {
      lessonTitle,
      totalLessons: this.lessons.length,
    }).subscribe({
      next: (res) => {
        this.progress = res.progress;
        this.syncLessonsFromProgress();
        this.isSaving = false;
        this.zone.run(() => this.cdr.detectChanges());
      },
      error: () => {
        this.rollbackLesson(lessonTitle);
        this.isSaving = false;
        this.zone.run(() => this.cdr.detectChanges());
      }
    });
  }

  private loadProgress() {
    if (!this.userId || this.userId === 'undefined') {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.progressService.getUserProgress(this.userId)
      .subscribe({
        next: (res) => {
          this.progress = res.progress;
          this.syncLessonsFromProgress();
          this.isLoading = false;
          this.zone.run(() => this.cdr.detectChanges());
        },
        error: () => {
          this.progress = null;
          this.isLoading = false;
          this.zone.run(() => this.cdr.detectChanges());
        }
      });
  }

  private syncLessonsFromProgress() {
    if (!this.progress?.completedLessons) {
      return;
    }
    const completed = new Set(this.progress.completedLessons);
    this.lessons = this.lessons.map((lesson) => ({
      ...lesson,
      completed: completed.has(lesson.title),
    }));
  }

  private rollbackLesson(lessonTitle: string) {
    this.lessons = this.lessons.map((lesson) =>
      lesson.title === lessonTitle ? { ...lesson, completed: false } : lesson
    );
  }
}

