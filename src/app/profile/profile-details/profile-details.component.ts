import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute} from '@angular/router'
import { UserService} from 'app/services/user.service'
import { User } from 'app/models/user';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  editing: boolean = false;
  user:User = null;
 
  userID:any;
  // profile: Profile;
  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) {

    // this.model = new User(userService.user._id, userService.user.firstName, userService.user.lastName, userService.user.email, userService.user.password);
  }



  ngOnInit() {
    console.log(this.userService.user) 
    // this.model = this.userService.user;
    // console.log(this.model)
    this.userID = {
      id: this.route.snapshot.params['id']
    }
 
    this.userService.getUserByID(this.userID).then((gottenUser:User) => {
      this.user = gottenUser;   
      // this.eventService.events = this.events;   
    });


  }

  
  onSubmit(){
  this.router.navigate(['/profile-edit']);
  }
}
