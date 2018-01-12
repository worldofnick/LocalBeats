import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  MatIconModule,
  MatButtonModule,
  MatSidenavModule,
  MatMenuModule,
  MatInputModule,
  MatListModule,
  MatToolbarModule,
  MatCardModule
 } from '@angular/material';
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
    RouterModule.forChild(ChatsRoutes)
  ],
  declarations: [AppChatsComponent]
})
export class AppChatsModule { }
