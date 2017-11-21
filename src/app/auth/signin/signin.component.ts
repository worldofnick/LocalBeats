import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { AuthService } from 'app/auth/auth.service';
import { User } from 'app/user/user';
import { print } from 'util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  private user: User;

  constructor(private authService: AuthService, private router: Router) { }

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
      token: null,
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      email: email,
      password: password
    };
    console.log(this.user);

    // this.authService.signinUser(this.user).then((user: User) => {
    //   this.user = user;
    //   this.router.navigate(['/profile']);
    // });
  }

  onSignup(form: NgForm) {
    const first_name = null
    const last_name = null
    const phone = null
    const email: string = form.value.email;
    const password: string = form.value.password;

    this.user = {
      token: null,
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      email: email,
      password: password
    };

    // this.authService.signupUser(this.user).then((user: User) => {
    //   this.user = user;
    //   this.router.navigate(['/profile']);
    // });
  }

}
