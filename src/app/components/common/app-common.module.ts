import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from 'ng2-translate/ng2-translate';
import { OffClickModule } from 'angular2-off-click';
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { 
  MatSidenavModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatListModule,
  MatTooltipModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatMenuModule,
  MatSnackBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatCardModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { TopbarComponent } from './topbar/topbar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CommonDirectivesModule } from '../../directives/common/common-directives.module';
import { ThemeService } from '../../services/theme/theme.service';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { NotificationService } from 'app/services/notification/notification.service';
import { SocketService } from 'app/services/chats/socket.service';

@NgModule({
  imports: [
    CommonModule,
    OffClickModule,
    CommonPipesModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule,
    FlexLayoutModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CommonDirectivesModule,
    TranslateModule
  ],
  declarations: [
    AdminLayoutComponent,
    TopbarComponent, 
    NavigationComponent, 
    NotificationsComponent, BreadcrumbComponent
  ],
  providers: [ThemeService, NotificationService, SocketService],
  exports: []
})
export class AppCommonModule {}