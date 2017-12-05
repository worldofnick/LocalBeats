import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { SigninComponent } from './auth/signin/signin.component';
import { UserService } from 'app/services/user.service';
import { UserGuard } from 'app/services/user-guard.service';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { ReviewsComponent } from './profile/reviews/reviews.component';
import { ReviewComponent } from './profile/review/review.component';
import { ProfileEditComponent } from './profile/profile-edit/profile-edit.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { SearchResultComponent } from './search/search-result/search-result.component';
import { SearchBarComponent } from './search/search-bar/search-bar.component';
import { CreateEventComponent } from './events/create-event/create-event.component';
import { EventService } from 'app/services/event.service';
import { EventPageComponent } from './events/event-page/event-page.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// import { NgDatepickerComponent } from '../../node_modules/ng2-datepicker';

// import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';
// import { MaterialModule } from '@angular/material';
// import { MaterialModule } from './material.module';
// import { DatePickerModule } from 'angular-material-datepicker';
// import { UserSearchResultComponent } from './search/user-search-result/user-search-result.component';
// import { EventSearchResultComponent } from './search/event-search-result/event-search-result.component';
import {CdkTableModule} from '@angular/cdk/table';
import { MyEventsComponent } from './events/my-events/my-events.component';
 


@NgModule({
  declarations: [
    AppComponent, 
    ContactDetailsComponent,
    ContactListComponent,
    SigninComponent,
    HomeComponent,
    ReviewsComponent,
    ReviewComponent,
    HeaderComponent,    
    FooterComponent,
    ProfileEditComponent,
    ProfileDetailsComponent,
    SearchResultComponent,
    SearchBarComponent,
    CreateEventComponent,
    EventPageComponent,
    MyEventsComponent,
    // NgDatepickerComponent,
    // Mat
    // UserSearchResultComponent,
    // EventSearchResultComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    // NgDatepickerComponent,
    HttpModule,
    // DatePickerModule,
    AppRoutingModule
  ],
  providers: [UserService, UserGuard, EventService],
  bootstrap: [AppComponent]
})
export class AppModule { }
