import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { print } from 'util';
import { Injectable } from '@angular/core';


@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})


export class ProfileEditComponent implements OnInit {
  submitted = false;
  private user: User;
  
  model:any;

  constructor(private userService: UserService, private router: Router) { 
    this.user = userService.user;
    this.model = new User(this.user._id, this.user.firstName, this.user.lastName, this.user.email, this.user.password);
  }

  ngOnInit() {

  }

  onEditProfile(form: NgForm) {
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
    };

    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;
      console.log(this.user)
      this.userService.user = this.user; 
      this.router.navigate(['/profile']);
    });
  }
  
}
