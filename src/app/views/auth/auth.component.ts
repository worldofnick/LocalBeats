import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';
import { NotificationService } from '../../services/notification/notification.service';

import * as socketIO from 'socket.io-client';
import { Notification } from 'app/models/notification';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  signinForm: FormGroup;
  user: User;
  notificationsList:Notification[] = []

  constructor(private userService: UserService, 
    private router: Router,
  private notificationService: NotificationService) { }

  private myClientId: string = '711608011009-hkpaqs61p6a0s7122qcko80sscd9odhu.apps.googleusercontent.com';

  handleGoogleSuccess(googleUser: gapi.auth2.GoogleUser) {
    console.log('Success: ', googleUser);
  }

  handleGoogleFailure(error) {
    console.log('Error: ', error);
  }

  ngOnInit() {

    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.myClientId,
        cookie_policy: 'single_host_origin',
        scope: 'profile email'
        // hosted_domain: this.hostedDomain,
        // openid_realm: this.openidRealm
      }).then(this.successCB, this.failCB);
    });

    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
  }

  successCB() {
    console.log('Done google init: ',gapi.auth2.getAuthInstance());
    gapi.signin2.render(
      'g-signin', {
        'scope': 'profile email',
        'width': 328,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': (googleUser: gapi.auth2.GoogleUser) => this.handleGoogleSuccess(googleUser)
        // onsuccess: (googleUser: gapi.auth2.GoogleUser) => this.onSuccess(googleUser),
        // onfailure: () => this.handleFailure()
      });
  }

  
  failCB() {
    console.log('Failed google init: ');
  }

  signin() {
    const signinData = this.signinForm.value
    this.user = {
      _id: null,
      firstName: null,
      lastName: null,
      email: signinData.username,
      password: signinData.password,
      spotifyID: null,
      genres: [],
      isArtist: true,
      profilePicUrl: "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png",
      eventTypes: [],
      socket: null,
      city: '',
      state: '',
      location: null,
      isOnline: true, 
      stripeAccountId: null
    };

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.userService.signinUser(this.user).then((user: User) => {
      this.user = user;
      this.userService.getNotificationsCountForUser(user._id);
      this.userService.getNotificationsForUser(user._id);
      this.router.navigate(['/']);
    });

  }

  onSignIn() {

  }

}
