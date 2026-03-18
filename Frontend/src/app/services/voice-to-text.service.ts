import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VoiceToTextResponse {
  success: boolean;
  message?: string;
  text?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceToTextService {
  private readonly baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  convertToSign(text: string): Observable<VoiceToTextResponse> {
    return this.http.post<VoiceToTextResponse>(`${this.baseUrl}/api/voice-to-text`, { text });
  }
}
