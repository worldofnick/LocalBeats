import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/auth/user.service';
import { BookingService } from '../../services/booking/booking.service';
import { NotificationService } from '../../services/notification/notification.service';
import { EventService } from '../../services/event/event.service';
import { User } from '../../models/user';
import { Booking } from '../../models/booking';
import { Event } from '../../models/event';
import { Notification } from '../../models/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  activeView: string = 'overview';
  user: User = new User; //changed this from null to new User
  onOwnProfile: boolean = null;
  userID: any = null;
  requested: boolean = null;
  clickedRequestArtist:boolean = null;

  clickedOverview = false;

  events:any[];
  requestedArtistEvents: any[] = [];
  requestedArtistBookings: any[] = [];
  appliedEvents: Event[] = [];
  appliedBookings: any[] = [];
  deleteStatus:Number;
  hasApplied:Boolean = true;

  constructor(private route: ActivatedRoute,
    private router : Router,
    private userService: UserService,
    private bookingService: BookingService,
    private eventService: EventService,
    private notificationService: NotificationService) {
    console.log("in profile component constructor");

     router.events.subscribe((url:any) => this.clickedOverview = router.url == "/profile/overview");

  }

  hasRequested() {
    if(!this.userService.isAuthenticated()){
      return;
    }
    this.bookingService.getUserBookings(this.userService.user, 'host').then((bookings: any[]) => {
      for (let result of bookings) {
        if (result.booking && result.booking.performerUser._id == this.user._id && !this.onOwnProfile) {
          this.requested = true;
        } else {
          this.requested = false;
        }
      }
    });
  }

    //not implemented
  sendNotification(){
    // this.socket.emit('create notification','Notification Test');
    // let notif:Notification = new Notification;
    // notif.sender = this.userService.user;
    // notif.receiverID = this.userService.user._id;
    // notif.message = "test message" ;
    // console.log(this.userService.user);
    // this.userService.sendNotificationToUser(notif);
 }


  onRequestArtist(ID:string){
    // this.router.navigate(['/pick-event', this.userService._id]);
    // this.clickedRequestArtist
  }

  onCancelArtist(ID:string) {
    // this.router.navigate(['/pick-event', this.userService._id]);
  }



  ngOnInit() {
    this.user = this.userService.user;
    this.activeView = this.route.snapshot.params['view']

    //snapshot params returns a javascript object. index into it with the property field to get a property.
    this.userID = {
      id: this.route.snapshot.params['id']
    }

    if (this.userID["id"] == null) {
      this.onOwnProfile = true;
      //this.user = this.userService.user;
    } else {
      //on another perons profile.

      this.onOwnProfile = false;
      let ID: String = this.userID["id"];

      this.userService.getUserByID(ID).then((gottenUser: User) => {
        this.user = gottenUser;
      }).then(() => this.hasRequested());
    }
  }
}
