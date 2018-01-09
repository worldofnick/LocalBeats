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
  
  public passwordsDontMatch:boolean = null;
  user:User;
  userID:any;
  public dropDownGenre:string;
  public passwordsUpdated : boolean = false;
  public firstPass: string;
  public secondPass: string;

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) { 
    // this.user = userService.user;
    // this.model = new User(this.user._id, this.user.firstName, this.user.lastName, this.user.email, this.user.password);
    
  }

  onChange(event: EventTarget) {
        console.log("FILE UPLOAD");
        let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
        let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
        let files: FileList = target.files;
        let file: File = files[0];
        let blob = file as Blob;
        console.log(blob);
    }

  ngOnInit() {
    this.user = this.userService.user;
    if(this.user.genres.length == 1){
      this.dropDownGenre = this.user.genres[0];
    }else{
      this.dropDownGenre = "choose genre here";
    }
    // this.userID = {
    //   id: this.route.snapshot.params['id']
    // }
    // //TODO set up subscription. fetching route paramters reactively
 
    // this.userService.getUserByID(this.userID).then((gottenUser:User) => {
    //   this.user = gottenUser;   
    //   // this.eventService.events = this.events;   
    // });
  }

  onSubmit() {
    console.log(this.user)
    this.user.genres = []
    this.user.genres.push(this.dropDownGenre)
    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;      
      this.userService.user = this.user; 
      this.router.navigate(['/profile']);
    });

  }

  onChangePassword() {
    if(this.firstPass == this.secondPass){
      this.passwordsDontMatch = false;
      this.user.password = this.firstPass;
    }else{
      this.passwordsDontMatch = true;
    }

    if(!this.passwordsDontMatch){
      this.userService.updatePassword(this.user).then((user:User) =>{
        this.user = user;
        this.userService.user = this.user;
        this.passwordsUpdated = true;
      })
    }
  }

  onEditProfile(form: NgForm) {
    console.log("form");
    console.log(form.value.firstname);
    console.log("user before form");
    console.log(this.user);
    const firstName = form.value.firstname;
    
    const lastName = form.value.lastname;
    const email: string = form.value.email;
    const genre: string = form.value.genre;
    this.dropDownGenre = genre;

    //TODO: only save the edited parts of the profile
    this.user.firstName = firstName;
    this.user.lastName = lastName;
    this.user.genres.splice(0,this.user.genres.length)
    this.user.genres.push(genre);
    this.user.email = email,
    // this.modelpassword: password,


    console.log("sending \n" );
    console.log(this.user);

    this.userService.onEditProfile(this.user).then((user: User) => {
      this.user = user;      
      this.userService.user = this.user; 
      this.router.navigate(['/profile']);
    });
  }
  onEditChangePass(form:NgForm){
    const p1 = form.value.firstPass;
    const p2 = form.value.secondPass;

    if(p1 == p2){
      this.passwordsDontMatch = false;
      this.user.password = p1;
    }else{
      this.passwordsDontMatch = true;
    }

    if(!this.passwordsDontMatch){
      this.userService.updatePassword(this.user).then((user:User) =>{
        this.user = user;
        this.userService.user = this.user;
        this.passwordsUpdated = true;
      })
    }
  }
  
}
