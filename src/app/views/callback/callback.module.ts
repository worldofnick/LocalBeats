import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatSidenavModule, MatMenuModule, MatInputModule,
         MatListModule, MatToolbarModule, MatCardModule, MatAutocompleteModule, MatChipsModule, MatDialogModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

//TODO: change
import { CallbackComponent } from './callback.component';
import { CallbackRoutes } from "./callback.routing";
import { SpotifyCallbackComponent } from './spotify-callback/spotify-callback.component';


@NgModule({
  imports: [
    CommonModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    RouterModule.forChild(CallbackRoutes) //TODO: change
  ],
  entryComponents: [CallbackComponent],
  declarations: [CallbackComponent, SpotifyCallbackComponent]
})
export class CallbackModule { }
