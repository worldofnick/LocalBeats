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
  // private user: User;
  
  model:User;

  constructor(private userService: UserService, private router: Router) { 
    // this.user = userService.user;
    // this.model = new User(this.user._id, this.user.firstName, this.user.lastName, this.user.email, this.user.password);
    this.model = userService.user;
  }

  ngOnInit() {

  }

  onEditProfile(form: NgForm) {
    const firstName = form.value.firstname;
    const lastName = form.value.lastname;
    const email: string = form.value.email;
    const password: string = form.value.password1;

    this.userService.onEditProfile(this.model).then((user: User) => {
      this.model = user;
      console.log(this.model)
      this.userService.user = this.model; 
      this.router.navigate(['/profile']);
    });
  }
  
}
