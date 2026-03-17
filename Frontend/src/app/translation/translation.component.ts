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
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  protected isCameraActive = signal(false);
  protected recognizedText = signal('');
  private stream: MediaStream | null = null;
  private predictionInterval: any = null;

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
        this.startPredictionLoop();
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("Please allow camera access to use the live translation feature.");
    }
  }

  startPredictionLoop() {
    this.predictionInterval = setInterval(() => {
      this.captureAndPredict();
    }, 1000);
  }

  async captureAndPredict() {
    if (!this.videoElement || !this.canvasElement || !this.isCameraActive()) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg');

      try {
        const response = await fetch('http://127.0.0.1:5001/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Image })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.prediction && data.prediction !== "None") {
            const currentText = this.recognizedText();
            const words = currentText.split(' ').filter(w => w.trim() !== '');
            const lastWord = words.length > 0 ? words[words.length - 1] : '';

            // This basic logic avoids repeating the same word many times in a row
            if (data.prediction !== lastWord) {
               this.recognizedText.set(currentText ? `${currentText} ${data.prediction}` : data.prediction);
            }
          }
        }
      } catch (error) {
        console.error('Error during prediction fetch:', error);
      }
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

    if (this.predictionInterval) {
      clearInterval(this.predictionInterval);
      this.predictionInterval = null;
    }
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