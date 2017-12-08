import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router'
import { UserService } from 'app/services/user.service'
import { User } from 'app/models/user';
import { BookingService } from 'app/services/booking.service';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  editing: boolean = false;
  user: User = null;
  public requested: boolean = null;

  onOwnProfile: boolean = null;
  userID: any = null;
  // profile: Profile;
  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private bookingService: BookingService) {

    // this.model = new User(userService.user._id, userService.user.firstName, userService.user.lastName, userService.user.email, userService.user.password);
  }



  ngOnInit() {
    //console.log("profile detailis onINIT, userService.user:");
    //console.log(this.userService.user)

    //snapshot params returns a javascript object. index into it with the property field to get a property.
    this.userID = {
      id: this.route.snapshot.params['id']
    }

    //console.log("id from url");
    //console.log(this.userID["id"]);
    if (this.userID["id"] == null) {
      //nothing in url.
      console.log('here')
      console.log(this.userService.user)
      this.onOwnProfile = true;
      this.user = this.userService.user;
      console.log("my profile:")
      console.log(this.user)
      
    } else {
      //on another perons profile.
      this.onOwnProfile = false;
      let ID:String = this.userID["id"];
      this.userService.getUserByID(ID).then((gottenUser: User) => {
        this.user = gottenUser;
        console.log("other user")
        console.log(this.user)
        }).then(() => this.hasRequested());
    }

    // if(this.userID != null){
    //   this.onOwnProfile = false;
    //   this.userService.getUserByID(this.userID).then((gottenUser:User) => {
    //     this.user = gottenUser;   
    //   });
    // }
    // if(this.user._id != this.userID["id"]){
    //   //if the profile the user is on, is not the users.
    //   this.userService.getUserByID(this.userID).then((gottenUser:User) => {
    //     this.user = gottenUser;   
    //     // this.eventService.events = this.events;   
    //   });
    //   this.onOwnProfile = false;
    // }else{
    //   this.user = this.userService.user;
    //   this.onOwnProfile = true;
    // }

    //console.log("is the user on his own profile?");
    //console.log(this.onOwnProfile);
  }

  onEditProfile() {
    this.router.navigate(['/profile-edit']);
  }

  onRequestArtist(ID:string){
    this.router.navigate(['/pick-event', this.user._id]);
  }

  onCancelArtist(ID:string) {
    this.router.navigate(['/pick-event', this.user._id]);
  }

  hasRequested() {
    this.bookingService.getUserBookings(this.userService.user, 'host').then((bookings: any[]) => {
      for (let result of bookings) {
        if (result.booking.performerUser._id == this.user._id && !this.onOwnProfile) {
          this.requested = true;
        } else {
          this.requested = false;
        }
      }
    }); 
  }


}
