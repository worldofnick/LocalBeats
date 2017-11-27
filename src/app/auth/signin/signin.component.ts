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

    console.log(email);
    console.log(password);
    console.log(remember);
    this.user = {
      _id: null,
      firstName: null,
      lastName: null,
      email: email,
      password: password,
    };
    console.log(this.user);

    this.userService.signinUser(this.user).then((user: User) => {
      this.user = user;
      console.log(this.user)
      this.router.navigate(['/profile']);
    });
  }

  onSignup(form: NgForm) {
    const firstName = null
    const lastName = null
    const phone = null
    const email: string = form.value.email;
    const password: string = form.value.password;

    this.user = {
      _id: null,
      firstName: null,
      lastName: null,
      email: email,
      password: password,
    };

    this.userService.signupUser(this.user).then((user: User) => {
      this.user = user;
      console.log(this.user)
      this.router.navigate(['/profile']);
    });
  }

}
