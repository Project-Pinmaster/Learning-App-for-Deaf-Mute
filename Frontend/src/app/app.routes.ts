import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { AuthComponent } from './auth/auth.component';
import { HandicapProfileComponent } from './handicap-profile/handicap-profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminGuard } from './admin-dashboard/admin.guard';
import { SettingsComponent } from './settings/settings.component';
import { authGuard } from './auth/auth.guard';
import { TranslationComponent } from './translation/translation.component';
import { LearningComponent } from './learning/learning.component';
import { VoiceToTextComponent } from './voice-to-text/voice-to-text.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'handicap-profile', component: HandicapProfileComponent, canActivate: [authGuard] },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'translation', component: TranslationComponent, canActivate: [authGuard] },
  { path: 'voice-to-text', component: VoiceToTextComponent, canActivate: [authGuard] },
  { path: 'learning', component: LearningComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
