import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper'

import { 
  MatSlideToggleModule,
  MatChipsModule,
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
  MatProgressSpinnerModule,
  MatTabsModule,
  MatProgressBarModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProfileComponent } from "./profile.component";
import { ProfileOverviewComponent } from './profile-overview/profile-overview.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfileBlankComponent } from './profile-blank/profile-blank.component';
import { ProfileRoutes } from "./profile.routing";
import { ProfileRequestComponent } from './profile-request/profile-request.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatProgressBarModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    CommonPipesModule,
    MatPaginatorModule,
    ImageCropperModule,
    RouterModule.forChild(ProfileRoutes)
  ],
  declarations: [ProfileComponent, ProfileOverviewComponent, ProfileSettingsComponent, ProfileBlankComponent, ProfileRequestComponent],
  exports: [],
  providers: [],
  entryComponents: []
})
export class ProfileModule { }
