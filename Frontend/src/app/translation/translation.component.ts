import { Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.css']
})
export class TranslationComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  protected isCameraActive = signal(false);
  protected recognizedText = signal('');
  private stream: MediaStream | null = null;

  toggleCamera() {
    if (this.isCameraActive()) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.isCameraActive.set(true);
        setTimeout(() => {
          if (this.isCameraActive()) this.recognizedText.set("Hello");
        }, 2000);
        setTimeout(() => {
          if (this.isCameraActive()) this.recognizedText.set("Hello, how");
        }, 3000);
        setTimeout(() => {
          if (this.isCameraActive()) this.recognizedText.set("Hello, how are you?");
        }, 4000);
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("Please allow camera access to use the live translation feature.");
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
    this.isCameraActive.set(false);
  }

  playAudio() {
    if (this.recognizedText()) {
      const utterance = new SpeechSynthesisUtterance(this.recognizedText());
      window.speechSynthesis.speak(utterance);
    }
  }

  clearText() {
    this.recognizedText.set('');
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}