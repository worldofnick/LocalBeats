import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  signinForm: FormGroup;
  user: User;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    })
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
      isArtist: true
    };

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.userService.signinUser(this.user).then((user: User) => {
      this.user = user;
      this.router.navigate(['/']);
    });

  }

}
