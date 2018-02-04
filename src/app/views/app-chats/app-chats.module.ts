import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatSidenavModule, MatMenuModule, MatInputModule,
         MatListModule, MatToolbarModule, MatCardModule, MatAutocompleteModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppChatsComponent } from './app-chats.component';
import { ChatsRoutes } from "./app-chats.routing";

@NgModule({
  imports: [
    CommonModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatCardModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    RouterModule.forChild(ChatsRoutes)
  ],
  declarations: [AppChatsComponent]
})
export class AppChatsModule { }
