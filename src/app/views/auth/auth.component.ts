import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/auth/user.service';
import { ChatsService } from '../../services/chats/chats.service';
import { SharedDataService } from '../../services/shared/shared-data.service';
import { User } from '../../models/user';
import { NotificationService } from '../../services/notification/notification.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { AuthService, GoogleLoginProvider } from 'angular5-social-login';
import * as socketIO from 'socket.io-client';
import { Notification } from 'app/models/notification';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['../../../assets/styles/main.css', '../../../assets/styles/util.css',
  './auth.component.css']
})
export class AuthComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  // @ViewChild(MatButton) submitButton: MatButton;
  @ViewChild(RecaptchaComponent) captcha: RecaptchaComponent;

  signinForm: FormGroup;
  user: User;
  notificationsList: Notification[] = [];
  // rememberMe: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  magicLinkButtonClicked: boolean = false;
  isDemoModeChecked = true;

  constructor(private userService: UserService, private sharedDataService: SharedDataService,
    private router: Router, private chatsService: ChatsService,
    private socialAuthService: AuthService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.error = false;
    // this.rememberMe = false;

    this.user = {
      _id: null,
      firstName: null,
      lastName: null,
      fullName: null,
      email: '',
      password: '',
      genres: [],
      isArtist: true,
      profilePicUrl: "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png",
      eventTypes: [],
      socket: null,
      city: '',
      averageRating: 0,
      state: '',
      location: null,
      isOnline: true,
      spotify: null,
      google: null,
      soundcloud: null,
      stripeAccountId: null
    };
    // Checks to see if the user credentials have been stored locally via 'remember me'
    // Populates them in the form if they exist
    // const data = JSON.parse(localStorage.getItem('rememberMe'));
    // if (data) {
    //   this.user.email = data.email;
    //   // this.user.password = data.password;
    //   this.rememberMe = true;
    // } else {
    //   this.rememberMe = false;
    // }
    // if (this.rememberMe) {
    //   this.signinForm = new FormGroup({
    //     username: new FormControl(this.user.email.valueOf(), Validators.required),
    //     // password: new FormControl(this.user.password.valueOf(), Validators.required),
    //     rememberMe: new FormControl(this.rememberMe)
    //   });
    // } else {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      // password: new FormControl('', Validators.required),
      //   rememberMe: new FormControl(this.rememberMe)
    });
    // }
  }

  /**
   * Password less sign in handler.
   * Steps:
   * 1. REST call server to send verification magic link to the provided email
   * 2. If error (email invalid or not in DB), display email not valid error message
   *    Else, redirect to the mail-client website?
   */
  signin() {
    const signinData = this.signinForm.value;
    this.user.email = this.signinForm.controls['username'].value;
    // this.submitButton.disabled = true;
    // this.progressBar.mode = 'indeterminate';

    console.log('Magic link clicked by Username: ' + this.user.email + 'with demo: ', this.isDemoModeChecked);
    // After this, the cpatchaResolved is automatically called
  }

  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    console.log('>> In social login mmethod: ', socialPlatformProvider);
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log(socialPlatform + 'sign in data : ', userData);
        // Now sign-in with userData
        this.userService.signInWithGoogleAccount(userData.idToken).subscribe(
          (data: any) => {
            // Correctly authenticated, redirect
            this.error = false;
            this.userService.userLoaded(data.user, data.token, false, false);
            this.userService.getNotificationsCountForUser(data.user._id);
            this.userService.getNotificationsForUser(data.user._id);
            this.sharedDataService.setOverallChatUnreadCount(data.user as User);
            this.router.navigate(['/']);
          },
          (error) => {
            console.log('Google Error: ', error);
            this.handleErrors(error);
          });
      }
    );
  }

  toggleDemoMode() {
    console.log('>> Toggle is at : ', this.isDemoModeChecked);
  }

  cpatchaResolved(captchaResponse: string) {
    // Contact server and verify the captchaResponse. If valid, proceed with
    // sending a magic link and logging in. Else, reset the box with an error message
    console.log(`Resolved captcha with response ${captchaResponse}:`);

    if (captchaResponse !== null) {
      this.userService.verifyCaptchaToken(captchaResponse).subscribe(
        (data: any) => {
          console.log('>> SUCCESS: ', data);
          this.magicLinkLogin();
        },
        (error: any) => {
          console.error(error);
          this.magicLinkButtonClicked = false;
          this.handleErrors(error);
        }
      );
    }
  }

  private magicLinkLogin() {
    if (!this.isDemoModeChecked) {
      this.userService.requestMagicLink(this.user).subscribe(
        (data: any) => {
          // Magic link successfully sent!
          this.error = false;
          this.magicLinkButtonClicked = true;
          // this.progressBar.mode = 'determinate';
        },
        (error) => {
          // Show user error message
          this.magicLinkButtonClicked = false;
          this.handleErrors(error);
        });
    } else {
      this.userService.demoModeSignInUser(this.user).subscribe(
        (data: any) => {
          // Correctly authenticated, redirect
          this.error = false;
          this.userService.userLoaded(data.user, data.token, false, false);
          this.userService.getNotificationsCountForUser(data.user._id);
          this.userService.getNotificationsForUser(data.user._id);
          this.sharedDataService.setOverallChatUnreadCount(data.user as User);
          this.router.navigate(['/']);
        },
        (error) => {
          this.handleErrors(error);
        });
    }
  }

  handleErrors(error) {
    this.captcha.reset();
    this.errorMessage = error;
    this.error = true;
    // this.submitButton.disabled = false;
    // this.progressBar.mode = 'determinate';
  }
}
