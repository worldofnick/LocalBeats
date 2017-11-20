import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent implements OnInit {

  name: string = "Adam R";
  ID: number = 123456;
  email: string = "hello@world.com";
  // profile: Profile;
  constructor() { 
  }

  getProfileName(){
    return name;
  }
  ngOnInit() {
  }

}


