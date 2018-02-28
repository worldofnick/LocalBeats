import { Routes } from '@angular/router';

import { CallbackComponent } from './callback.component';
import { SpotifyCallbackComponent } from './spotify-callback/spotify-callback.component';

export const CallbackRoutes: Routes = [
    { 
      path: '',
      component: CallbackComponent,
      data: { title: 'Callback', breadcrumb: 'CALLBACK' },
      children: [{
        path: 'spotify',
        component: SpotifyCallbackComponent,
        data: { title: 'SpotifyCB', breadcrumb: 'SPOTIFYCB' }
      }]
    }
];