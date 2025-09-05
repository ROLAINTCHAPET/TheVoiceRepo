import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), // ← Configuration HttpClient
    // Ajoutez d'autres providers ici si nécessaire
  ]
}).catch(err => console.error(err));