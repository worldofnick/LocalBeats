import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { User } from 'app/models/user';
import { print } from 'util';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  valid = false
  private user: User;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  onSignin(form: NgForm) {
    const first_name = null
    const last_name = null
    const phone = null
    const email: string = form.value.email;
    const password: string = form.value.password;
    const remember: boolean = form.value.check;

    this.user = {
      _id: null,
      firstName: null,
      lastName: null,
      email: email,
      password: password,
      spotifyID: null
    };

    this.userService.signinUser(this.user).then((user: User) => {
      this.user = user;
      this.router.navigate(['/']);
    });
  }

  onSignup(form: NgForm) {
    const firstName = form.value.firstname;
    const lastName = form.value.lastname;
    const email: string = form.value.email;
    const password: string = form.value.password1;

    this.user = {
      _id: null,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      spotifyID: null
    };

    this.userService.signupUser(this.user).then((user: User) => {
      this.user = user;
      this.router.navigate(['/']);
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

}
