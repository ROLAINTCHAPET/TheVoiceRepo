import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screenshot-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div class="upload-card">
        <h3>Télécharger votre reçu</h3>
        <p>Sélectionnez une capture d'écran de votre reçu de vote</p>
        
        <div class="upload-area" 
             [class.dragover]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <div class="upload-icon">📷</div>
          <p class="upload-text">
            Glissez votre image ici ou cliquez pour sélectionner
          </p>
          <p class="upload-hint">PNG, JPG jusqu'à 5MB</p>
        </div>
        
        <input 
          #fileInput
          type="file" 
          accept="image/*" 
          (change)="onFileSelected($event)"
          style="display: none;">
        
        <div class="preview-section" *ngIf="selectedFile">
          <h4>Aperçu</h4>
          <img [src]="previewUrl" alt="Aperçu" class="preview-image">
          <p class="file-info">{{ selectedFile.name }} ({{ getFileSize(selectedFile.size) }})</p>
        </div>
        
        <div class="upload-actions">
          <button class="cancel-btn" (click)="cancel()">
            <span>Annuler</span>
          </button>
          <button 
            class="upload-btn" 
            [disabled]="!selectedFile"
            (click)="uploadScreenshot()">
            <span>📤</span>
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .upload-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    .upload-card h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .upload-card > p {
      color: #6b7280;
      text-align: center;
      margin: 0 0 32px 0;
    }

    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 24px;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #E31E24;
      background: #fef2f2;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 8px 0;
    }

    .upload-hint {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }

    .preview-section {
      margin-bottom: 24px;
    }

    .preview-section h4 {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px 0;
    }

    .preview-image {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      margin-bottom: 8px;
    }

    .file-info {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      margin: 0;
    }

    .upload-actions {
      display: flex;
      gap: 12px;
    }

    .cancel-btn, .upload-btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      background: #f3f4f6;
      color: #374151;
    }

    .cancel-btn:hover {
      background: #e5e7eb;
    }

    .upload-btn {
      background: linear-gradient(135deg, #E31E24 0%, #c41e3a 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .upload-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(227, 30, 36, 0.3);
    }

    .upload-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `]
})
export class ScreenshotUploadComponent {
  @Output() screenshotUploaded = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string = '';
  isDragOver: boolean = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    this.selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadScreenshot(): void {
    if (this.selectedFile && this.previewUrl) {
      this.screenshotUploaded.emit(this.previewUrl);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}