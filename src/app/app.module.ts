import { Component, ElementRef, NgModule, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { SigninComponent } from './auth/signin/signin.component';
import { UserService } from 'app/services/user.service';
import { SearchService } from 'app/services/search.service';
import { BookingService } from 'app/services/booking.service';
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
import { MyEventsComponent } from './events/my-events/my-events.component';
import { EventComponent } from './events/event/event.component';
import { UserSearchResultComponent } from './search/user-search-result/user-search-result.component';
import { EventSearchResultComponent } from './search/event-search-result/event-search-result.component';




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
    EventComponent,
    UserSearchResultComponent,
    EventSearchResultComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBCko4eEq6azFCzCXVXAF4_jylVNw4ZM7Q",
      libraries: ["places"]
    }),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [UserService, UserGuard, EventService, SearchService, BookingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
