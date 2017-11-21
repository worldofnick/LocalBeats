import { Component, OnInit } from '@angular/core';
import { User } from 'app/user/user';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})


// User: 
// token: string;
// first_name: string;
// last_name: string;
// email: string;
// phone: string;
// password: string;


export class ProfileEditComponent implements OnInit {
  submitted = false;
  // model = new UserComponent(1238, 'Adam', 'adam@gmail.com');
  // public 
  constructor(private router: Router) { }

  ngOnInit() {

  }
  
    onSubmit() { 
      this.router.navigate(['/profile']);
      // this.submitted = true; 
    }
}
