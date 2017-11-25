import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})


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
