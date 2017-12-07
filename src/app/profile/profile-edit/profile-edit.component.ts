import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router, ActivatedRoute } from '@angular/router';
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
  
  user:User;
  userID:any;

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) { 
    // this.user = userService.user;
    // this.model = new User(this.user._id, this.user.firstName, this.user.lastName, this.user.email, this.user.password);
    
  }

  ngOnInit() {
    this.user = this.userService.user;
    // this.userID = {
    //   id: this.route.snapshot.params['id']
    // }
    // //TODO set up subscription. fetching route paramters reactively
 
    // this.userService.getUserByID(this.userID).then((gottenUser:User) => {
    //   this.user = gottenUser;   
    //   // this.eventService.events = this.events;   
    // });
  }

  onEditProfile(form: NgForm) {
    const firstName = form.value.firstname;
    const lastName = form.value.lastname;
    const email: string = form.value.email;

    //TODO: only save the edited parts of the profile
    this.user.firstName = firstName,
    this.user.lastName = lastName,
    this.user.email = email,
    // this.modelpassword: password,


    console.log("sending \n" );
    console.log(this.user);

    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;      
      this.userService.user = this.user; 
      this.router.navigate(['/profile', this.user._id]);
    });
  }
  
}
