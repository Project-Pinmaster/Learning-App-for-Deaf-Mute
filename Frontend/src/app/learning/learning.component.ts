import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Lesson {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  videoUrl?: string;
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
    { id: 1, title: 'Alphabet Basics', description: 'Learn the ASL alphabet from A to Z.', duration: '5 min', completed: false },
    { id: 2, title: 'Common Greetings', description: 'Say hello, goodbye, and introduce yourself.', duration: '10 min', completed: false },
    { id: 3, title: 'Numbers 1-10', description: 'Learn to count using sign language.', duration: '5 min', completed: false },
    { id: 4, title: 'Family Members', description: 'Signs for mother, father, brother, sister, etc.', duration: '15 min', completed: false },
    { id: 5, title: 'Questions & Answers', description: 'Who, what, when, where, why, and how.', duration: '12 min', completed: false },
  ];

  selectedLesson: Lesson | null = null;

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
    if (this.selectedLesson) {
      this.selectedLesson.completed = true;
      this.selectedLesson = null;
    }
  }
}