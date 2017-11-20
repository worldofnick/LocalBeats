import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService} from 'app/services/user.service'
import { User } from 'app/models/user';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  editing: boolean = false;
 
  // profile: Profile;
  constructor(private userService: UserService, private router: Router) { 
    this.userService.user = {
      token: null,
      first_name: 'Adam',
      last_name: 'Rosenberg',
      email: 'adam@adam.com',
      phone: '3305555555',
      password: 'brandon'
    }
  }

  getProfileName(){
    return this.userService.user.first_name + ' ' + this.userService.user.last_name;
  }

  ngOnInit() {
  }

  onSubmit(){
  this.router.navigate(['/profile-edit']);
  }
}
