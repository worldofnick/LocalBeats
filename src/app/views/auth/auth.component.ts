import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/auth/user.service';
import { ChatsService } from '../../services/chats/chats.service';
import { SharedDataService } from '../../services/shared/shared-data.service';
import { SocketService } from '../../services/chats/socket.service';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { Message } from '../../services/chats/model/message';
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
  isDemoModeChecked = false;
  numOfWrongPasswordAttemps: number;
  isPasswordResetApproved = false;

  constructor(private userService: UserService, private sharedDataService: SharedDataService,
    private router: Router, private chatsService: ChatsService,
    private socialAuthService: AuthService, private _socketService: SocketService,
    private notificationService: NotificationService) { }

  ngOnInit() {
    this.error = false;
    this.numOfWrongPasswordAttemps = 0;
    this.isPasswordResetApproved = false;

    this._socketService.onEvent(SocketEvent.MAGIC_LOGIN_RESULT)
      .subscribe((message: Message) => {
        this.handleSameTabMagicLogin(message.serverPayload);
      });

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
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  signin() {
    const signinData = this.signinForm.value;
    this.user.email = this.signinForm.controls['username'].value;
    this.user.password = this.signinForm.controls['password'].value;
  }

  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        // Now sign-in with userData
        this.userService.signInWithGoogleAccount(userData.idToken).subscribe(
          (data: any) => {
            // Correctly authenticated, redirect
            this.error = false;
            this.userService.magicLinkDemiSignIn(data.user as User).subscribe(
              (result: any) => {
                this.userService.userLoaded(result.user, result.token, false, false);
                this.userService.getNotificationsCountForUser(result.user._id);
                this.userService.getNotificationsForUser(result.user._id);
                this.sharedDataService.setOverallChatUnreadCount(result.user);
                this.router.navigate(['/']);
              });
          },
          (error) => {
            this.handleErrors(error);
          });
      }
    );
  }

  toggleDemoMode() {
    // Do nothing for now. DO NOT REMOVE
  }

  cpatchaResolved(captchaResponse: string) {
    // Contact server and verify the captchaResponse. If valid, proceed with
    // sending a magic link and logging in. Else, reset the box with an error message
    if (captchaResponse !== null) {
      this.userService.verifyCaptchaToken(captchaResponse).subscribe(
        (data: any) => {
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
        },
        (error) => {
          // Show user error message
          this.numOfWrongPasswordAttemps++;
          this.magicLinkButtonClicked = false;
          this.handleErrors(error);
        });
    } else {
      this.userService.demoModeSignInUser(this.user).subscribe(
        (data: any) => {
          // Correctly authenticated, redirect
          this.error = false;
          this.userService.magicLinkDemiSignIn(data.user as User).subscribe(
            (result: any) => {
              this.userService.userLoaded(result.user, result.token, false, false);
              this.userService.getNotificationsCountForUser(result.user._id);
              this.userService.getNotificationsForUser(result.user._id);
              this.sharedDataService.setOverallChatUnreadCount(result.user);
              this.router.navigate(['/']);
            });
        },
        (error) => {
          this.numOfWrongPasswordAttemps++;
          this.handleErrors(error);
        });
    }
  }

  passwordResetLinkClicked() {
    this.user.email = this.signinForm.controls['username'].value;
    this.userService.requestPasswordResetMagicLink(this.user).subscribe(
      (data: any) => {
        // Magic link successfully sent!
        this.error = false;
        this.magicLinkButtonClicked = true;
        this.isPasswordResetApproved = true;
      },
      (error) => {
        // Show user error message
        this.numOfWrongPasswordAttemps++;
        this.isPasswordResetApproved = false;
        this.magicLinkButtonClicked = false;
        this.handleErrors(error);
      });
  }

  handleErrors(error) {
    if (this.captcha !== null && this.captcha !== undefined) {
      this.captcha.reset();
    }
    this.errorMessage = error;
    this.error = true;
  }

  handleSameTabMagicLogin(result) {
    if (this.user !== null && this.user !== undefined) {
      if (result.statusCode === 200) {
        if (result.user.email === this.user.email) {
          this.error = false;
          this.userService.magicLinkDemiSignIn(result.user as User).subscribe(
            (data: any) => {
              this.userService.userLoaded(data.user, data.token, false, false);
              this.userService.getNotificationsCountForUser(data.user._id);
              this.userService.getNotificationsForUser(data.user._id);
              this.sharedDataService.setOverallChatUnreadCount(data.user);
              this.router.navigate(['/']);
            });
        } else {
          // Do nothing for now
        }
      } else if (result.statusCode === 404) {
        this.magicLinkButtonClicked = false;
        this.router.navigate(['/auth', 'register']);
      } else {
        this.magicLinkButtonClicked = false;
        this.handleErrors('Something went wrong on the server side... Please try again later');
      }
    }
  }
}
