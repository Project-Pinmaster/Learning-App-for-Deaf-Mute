import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProgress {
  completedLessons: string[];
  lessonsCompletedCount: number;
  currentLesson: string | null;
  progressPercentage: number;
  lastLessonAccessed: string | null;
  practiceWords: string[];
}

export interface ProgressUpdateRequest {
  lessonTitle: string;
  totalLessons?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getUserProgress(userId: string): Observable<{ success: boolean; progress: UserProgress }> {
    return this.http.get<{ success: boolean; progress: UserProgress }>(
      `${this.baseUrl}/api/progress/${userId}`
    );
  }

  updateUserProgress(
    userId: string,
    payload: ProgressUpdateRequest
  ): Observable<{ success: boolean; progress: UserProgress }> {
    return this.http.put<{ success: boolean; progress: UserProgress }>(
      `${this.baseUrl}/api/progress/${userId}`,
      payload
    );
  }
}
