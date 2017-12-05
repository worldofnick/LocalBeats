import { Component, ElementRef, NgModule, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';
import { BrowserModule } from "@angular/platform-browser";
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { SigninComponent } from './auth/signin/signin.component';
import { UserService } from 'app/services/user.service';
import { SearchService } from 'app/services/search.service';
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
    SearchBarComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBCko4eEq6azFCzCXVXAF4_jylVNw4ZM7Q",
      libraries: ["places"]
    }),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [UserService, UserGuard, SearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
