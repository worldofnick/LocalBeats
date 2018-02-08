import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatSidenavModule, MatMenuModule, MatInputModule,
         MatListModule, MatToolbarModule, MatCardModule, MatAutocompleteModule, MatChipsModule, MatDialogModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppChatsComponent, DialogOverviewExampleDialog } from './app-chats.component';
import { ChatsRoutes } from "./app-chats.routing";


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
    RouterModule.forChild(ChatsRoutes)
  ],
  entryComponents: [AppChatsComponent, DialogOverviewExampleDialog],
  declarations: [AppChatsComponent, DialogOverviewExampleDialog]
  // bootstrap: [AppChatsComponent]
})
export class AppChatsModule { }
