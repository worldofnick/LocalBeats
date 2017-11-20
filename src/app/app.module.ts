import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
<<<<<<< HEAD
import { ProfileComponent } from './profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileWrapperComponent } from './profile-wrapper/profile-wrapper.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ReviewComponent } from './review/review.component';
=======
import { SigninComponent } from './auth/signin/signin.component';
import { AuthService } from 'app/auth/auth.service';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AppRoutingModule } from 'app/app-routing.module';
>>>>>>> d57e0ac07f07bfbed7917eb8c228ec5e3447acc9

@NgModule({
  declarations: [
    AppComponent,
    ContactDetailsComponent,
    ContactListComponent,
<<<<<<< HEAD
    ProfileComponent,
    NavbarComponent,
    EditProfileComponent,
    ProfileWrapperComponent,
    ReviewsComponent,
    ReviewComponent,
=======
    SigninComponent,
    UserComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent
>>>>>>> d57e0ac07f07bfbed7917eb8c228ec5e3447acc9
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
