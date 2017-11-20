import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  editing: boolean = false;
  name: string = "Adam R";
  ID: number = 123456;
  email: string = "hello@world.com";
  // profile: Profile;
  constructor(private router: Router) { 
  }

  getProfileName(){
    return name;
  }

  ngOnInit() {
  }

  onSubmit(){
  this.router.navigate(['/profile-edit']);
  }
}
