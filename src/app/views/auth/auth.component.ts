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
  notificationsList:Notification[] = [];
  rememberMe: boolean = false;
  error: boolean = false;
  errorMessage: string = '';

  constructor(private userService: UserService, 
    private router: Router,
  private notificationService: NotificationService) { }

  ngOnInit() {
    this.error = false;
    this.rememberMe = false;

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
      soundcloud: null,
      stripeAccountId: null
    };
    // Checks to see if the user credentials have been stored locally via 'remember me'
    // Populates them in the form if they exist
    const data = JSON.parse(localStorage.getItem('rememberMe'));
    if (data) {
      this.user.email = data.email;
      this.user.password = data.password;
      this.rememberMe = true;
    } else {
      this.rememberMe = false;
    }
    if(this.rememberMe) {
      this.signinForm = new FormGroup({
        username: new FormControl(this.user.email.valueOf(), Validators.required),
        password: new FormControl(this.user.password.valueOf(), Validators.required),
        rememberMe: new FormControl(this.rememberMe)
      });
    } else {
      this.signinForm = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        rememberMe: new FormControl(this.rememberMe)
      });
    }
  }

  signin() {
    const signinData = this.signinForm.value
    this.user.email = this.signinForm.controls['username'].value;
    this.user.password = this.signinForm.controls['password'].value;
    this.rememberMe = this.signinForm.controls['rememberMe'].value;

    if(this.rememberMe) {
      localStorage.setItem('rememberMe',
        JSON.stringify({ email: this.user.email, password: this.user.password }));
    } else {
      localStorage.removeItem('rememberMe');
    }

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
    this.userService.signinUser(this.user).subscribe(
      (data: any) => {
        // Correctly authenticated, redirect
        this.error = false;
        this.userService.userLoaded(data.user, data.token, false, false);
        this.userService.getNotificationsCountForUser(data.user._id);
        this.userService.getNotificationsForUser(data.user._id);
        this.router.navigate(['/']);

      },
      (error) => {
        // Show user error message
        this.errorMessage = error;
        this.error = true;
        this.submitButton.disabled = false;
        this.progressBar.mode = 'determinate';
      });
    }

}
