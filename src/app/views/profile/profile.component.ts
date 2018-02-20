import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/auth/user.service';
import { BookingService } from '../../services/booking/booking.service';
import { NotificationService } from '../../services/notification/notification.service';
import { EventService } from '../../services/event/event.service';
import { SocketService } from '../../services/chats/socket.service';
import { Action } from '../../services/chats/model/action';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
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
    public userService: UserService,
    private bookingService: BookingService,
    private eventService: EventService,
    private notificationService: NotificationService,
    private _socketService: SocketService) {

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

  ngOnInit() {
    this.user = this.userService.user;
    this.activeView = this.route.snapshot.params['view'];
    

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

    //received socket emition from server about updating profile 
    this._socketService.onEvent(SocketEvent.UPDATE_PROFILE).subscribe((user: User) => {
      this.user = user;
    });
  }

  clickedOver() {
    this.clickedOverview = true;
  }

  onStartNewConversationFromProfileButtonClick() {
    
    // If the user clicked message to some other user, then initiate conversation with it
    if (!this.onOwnProfile) {
      let message:Message = {
        to: this.user
      };

      this.router.navigate(['/chat']);
      this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
    }
  }
}
