import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceToTextService } from '../services/voice-to-text.service';

interface FloatingItem {
  src: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

@Component({
  selector: 'app-voice-to-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voice-to-text.component.html',
  styleUrls: ['./voice-to-text.component.css']
})
export class VoiceToTextComponent implements OnDestroy {
  protected transcript = signal('');
  protected isListening = signal(false);
  protected isPaused = signal(false);
  protected statusMessage = signal('Stopped');
  protected errorMessage = signal('');
  protected isSending = signal(false);
  protected floatingItems = signal<FloatingItem[]>([]);

  private recognition: any = null;
  private shouldRestart = false;
  private finalTranscript = '';

  constructor(private voiceService: VoiceToTextService) {
    this.generateFloatingItems();
  }

  private generateFloatingItems() {
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
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const floatingCount = 6 + Math.floor(Math.random() * 4);
    const items: FloatingItem[] = [];

    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    const padding = 32;
    const centerBlock = {
      x1: width * 0.22,
      x2: width * 0.78,
      y1: height * 0.16,
      y2: height * 0.84
    };

    for (let i = 0; i < floatingCount; i += 1) {
      let size = 96;
      let x = padding;
      let y = padding;
      let attempts = 0;

      const hasOverlap = (nextX: number, nextY: number, nextSize: number) => {
        return items.some(item => {
          const dx = nextX - item.x;
          const dy = nextY - item.y;
          const minDistance = nextSize / 2 + item.size / 2 + 12;
          return Math.hypot(dx, dy) < minDistance;
        });
      };

      do {
        const maxX = Math.max(padding, width - size - padding);
        const maxY = Math.max(padding, height - size - padding);
        x = padding + Math.random() * (maxX - padding);
        y = padding + Math.random() * (maxY - padding);
        attempts += 1;
      } while (
        attempts < 80 &&
        ((x > centerBlock.x1 && x < centerBlock.x2 && y > centerBlock.y1 && y < centerBlock.y2) ||
          hasOverlap(x, y, size))
      );

      if (hasOverlap(x, y, size)) {
        size = 80;
        attempts = 0;
        do {
          const maxX = Math.max(padding, width - size - padding);
          const maxY = Math.max(padding, height - size - padding);
          x = padding + Math.random() * (maxX - padding);
          y = padding + Math.random() * (maxY - padding);
          attempts += 1;
        } while (
          attempts < 20 &&
          ((x > centerBlock.x1 && x < centerBlock.x2 && y > centerBlock.y1 && y < centerBlock.y2) ||
            hasOverlap(x, y, size))
        );
      }

      items.push({
        src: shuffled[i],
        x,
        y,
        size,
        delay: Math.random() * 2.5
      });
    }

    this.floatingItems.set(items);
  }

  async startRecording() {
    this.errorMessage.set('');

    if (!this.isSpeechAllowed()) {
      return;
    }

    const micReady = await this.ensureMicPermission();
    if (!micReady) {
      return;
    }

    if (!this.recognition) {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionCtor) {
        this.errorMessage.set('Speech recognition is not supported in this browser.');
        return;
      }

      this.recognition = new SpeechRecognitionCtor();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening.set(true);
        this.errorMessage.set('');
        this.statusMessage.set('Listening...');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const piece = result[0]?.transcript ?? '';
          if (result.isFinal) {
            this.finalTranscript = this.appendTranscript(this.finalTranscript, piece);
          } else {
            interimTranscript += piece;
          }
        }
        const combined = `${this.finalTranscript} ${interimTranscript}`.trim();
        this.transcript.set(combined);
      };

      this.recognition.onerror = (event: any) => {
        const error = event?.error;

        if (error === 'aborted') {
          return;
        }

        if (error === 'no-speech') {
          this.errorMessage.set('No speech detected. Please try again.');
          if (this.shouldRestart && !this.isPaused()) {
            this.safeRestart();
          }
          return;
        }

        if (error === 'audio-capture') {
          this.errorMessage.set('Microphone not found. Please check your device.');
        } else if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.errorMessage.set('Microphone access denied. Please allow permissions.');
        } else if (error === 'network') {
          this.errorMessage.set('');
          if (
            window.location.protocol !== 'https:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1'
          ) {
            this.errorMessage.set('Speech recognition needs HTTPS (or localhost).');
          }
          if (this.shouldRestart && !this.isPaused()) {
            this.safeRestart();
          }
          return;
        } else {
          this.errorMessage.set('Speech recognition error. Please try again.');
        }

        this.shouldRestart = false;
        this.isListening.set(false);
        this.statusMessage.set('Stopped');
      };

      this.recognition.onend = () => {
        if (this.shouldRestart && !this.isPaused()) {
          this.safeRestart();
          return;
        }

        this.isListening.set(false);
        if (!this.isPaused()) {
          this.statusMessage.set('Stopped');
        }
      };
    }

    this.isPaused.set(false);
    this.shouldRestart = true;
    this.finalTranscript = this.transcript().trim();
    this.safeStart();
  }

  private appendTranscript(base: string, addition: string) {
    const trimmed = addition.trim();
    if (!trimmed) return base;
    if (!base) return trimmed;
    return `${base} ${trimmed}`;
  }

  private isSpeechAllowed() {
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isSecure = window.location.protocol === 'https:';

    if (!isSecure && !isLocalhost) {
      this.errorMessage.set('Speech recognition works only on HTTPS or localhost.');
      this.shouldRestart = false;
      this.statusMessage.set('Stopped');
      return false;
    }

    return true;
  }

  private async ensureMicPermission() {
    if (!navigator?.mediaDevices?.getUserMedia) {
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      this.errorMessage.set('Please allow microphone access to start recording.');
      this.shouldRestart = false;
      this.statusMessage.set('Stopped');
      return false;
    }
  }

  private safeStart() {
    try {
      this.recognition.start();
    } catch (err) {
      this.errorMessage.set('Unable to start speech recognition.');
    }
  }

  private safeRestart() {
    setTimeout(() => {
      try {
        this.recognition.start();
      } catch (err) {
        this.isListening.set(false);
        this.statusMessage.set('Stopped');
      }
    }, 250);
  }

  stopRecording() {
    this.shouldRestart = false;
    this.isPaused.set(false);
    this.isListening.set(false);
    this.statusMessage.set('Stopped');

    if (this.recognition) {
      this.recognition.stop();
    }
  }

  pauseRecording() {
    if (!this.isListening()) return;

    this.shouldRestart = false;
    this.isPaused.set(true);
    this.statusMessage.set('Paused');

    if (this.recognition) {
      this.recognition.stop();
    }
  }

  resumeRecording() {
    if (this.isListening() && !this.isPaused()) return;

    this.isPaused.set(false);
    this.shouldRestart = true;
    this.statusMessage.set('Listening...');

    if (this.recognition) {
      this.safeStart();
    } else {
      this.startRecording();
    }
  }

  clearText() {
    this.transcript.set('');
    this.finalTranscript = '';
    this.errorMessage.set('');
  }

  convertToSign() {
    const text = this.transcript().trim();
    if (!text) {
      this.errorMessage.set('Please record or enter some text first.');
      return;
    }

    this.errorMessage.set('');
    this.isSending.set(true);
    this.statusMessage.set('Processing...');

    this.voiceService.convertToSign(text).subscribe({
      next: () => {
        this.isSending.set(false);
        this.statusMessage.set('Ready to convert.');
      },
      error: () => {
        this.isSending.set(false);
        this.errorMessage.set('Failed to send text to the server.');
        this.statusMessage.set('Stopped');
      }
    });
  }

  ngOnDestroy() {
    this.shouldRestart = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
