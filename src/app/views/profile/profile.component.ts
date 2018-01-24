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

  // Doughnut
  doughnutChartColors: any[] = [{
    backgroundColor: ['#fff', 'rgba(0, 0, 0, .24)',]
  }];

  total1: number = 500;
  data1: number = 200;
  doughnutChartData1: number[] = [this.data1, (this.total1 - this.data1)];

  total2: number = 1000;
  data2: number = 400;
  doughnutChartData2: number[] = [this.data2, (this.total2 - this.data2)];

  doughnutChartType = 'doughnut';
  doughnutOptions: any = {
    cutoutPercentage: 85,
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false,
      position: 'bottom'
    },
    elements: {
      arc: {
        borderWidth: 0,
      }
    },
    tooltips: {
      enabled: false
    }
  };

  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private bookingService: BookingService,
    private eventService: EventService,
    private notificationService: NotificationService) {
    console.log("in profile component constructor");
  }

  hasRequested() {
    if(!this.userService.isAuthenticated()){
      return;
    }
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

  sendNotificationToUser(){
    // this.socket.emit('create notification','Notification Test');
    let notif:Notification = new Notification;
    notif.sender = this.userService.user;
    notif.receiver = this.userService.user;
    notif.message = "test message" ;
    this.notificationService.sendNotificationToUser(notif)
 }


  onRequestArtist(ID:string){
    // this.router.navigate(['/pick-event', this.user._id]);
    // this.clickedRequestArtist
  }

  onCancelArtist(ID:string) {
    // this.router.navigate(['/pick-event', this.user._id]);
  }



  ngOnInit() {
    this.activeView = this.route.snapshot.params['view']
    this.user = this.userService.user;

    //snapshot params returns a javascript object. index into it with the property field to get a property.
    this.userID = {
      id: this.route.snapshot.params['id']
    }

    console.log("id from url");
    console.log(this.userID["id"]);
    if (this.userID["id"] == null) {
      //nothing in url.
      console.log('on own profile')
      console.log(this.userService.user)
      this.onOwnProfile = true;
      this.user = this.userService.user;
    } else {
      //on another perons profile.

      this.onOwnProfile = false;
      let ID: String = this.userID["id"];
      console.log("on another perosns profile");
      console.log(ID);

      this.userService.getUserByID(ID).then((gottenUser: User) => {
        this.user = gottenUser;
        // console.log("other user")
        // console.log(this.user)
      }).then(() => this.hasRequested());
    }
  }
}
