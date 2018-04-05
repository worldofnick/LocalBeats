import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from '@angular/common'
import { Router } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking, StatusMessages, NegotiationResponses, BookingType } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'
import { SocketService } from '../../../services/chats/socket.service';
import { Message } from '../../../services/chats/model/message';
import { MessageTypes } from '../../../services/chats/model/messageTypes';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { SharedDataService } from '../../../services/shared/shared-data.service';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  getDate,
  getDay,
  getMonth,
  getYear
} from 'date-fns';
@Component({
  selector: 'app-event-singleton',
  templateUrl: './event-singleton.component.html',
  styleUrls: ['./event-singleton.component.css']
})
export class EventSingletonComponent implements OnInit {

  public model: Event = new Event;
  public user: User = new User;
  public userBooking: Booking;
  public isCurrentUser: boolean = null;
  public hasApplied: boolean = null;
  public dateInBar: Date;
  public zoom: number;
  public lat: number;
  public lng: number;
  sameDay:Boolean;
  private subscription: ISubscription;
  EID: any;
  buttonText: string = "Apply";
  setLocation = false;

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    private _sharedDataService: SharedDataService,
    public datepipe: DatePipe,
    private mapsAPILoader: MapsAPILoader,
    private AgmCoreModule: AgmCoreModule
  ) { }

  ngOnInit() {
    this.EID = {
      id: this.route.snapshot.params['id']
    }

    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
      this.lat = this.model.location[1]
      this.lng = this.model.location[0]
      this.zoom = 12;
      if (isSameDay(subDays(this.model.fromDate, 0), subDays(this.model.toDate,0))){
          this.sameDay = true;
      }else {
        this.sameDay = false;
      }
      this.user = event.hostUser;
      if (this.userService.user != null && this.user._id === this.userService.user._id) {
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    }).then(() => {
      if(this.userService.isAuthenticated()) {
        this.getBooking()
        this.subscription = this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
        .subscribe((notification: Notification) => {
          
          if (notification.response != NegotiationResponses.payment) {
            this.updateModel(notification.booking, notification.response);
          }
          
        });
      }
    });
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    if(response != NegotiationResponses.cancel && response != NegotiationResponses.decline) {
      this.userBooking = newBooking;
      this.hasApplied = true;
    } else {
      this.userBooking = null;
      this.hasApplied = false;
      if(this.model.negotiable) {
        this.buttonText = "Bid";
      } else {
        this.buttonText = "Apply";
      }
    }
  }

  private getBooking() {
    this.bookingService.getBooking(this.model).then((bookings: Booking[]) => {
      this.userBooking = bookings.find(b => b.performerUser._id == this.userService.user._id && !b.cancelled);
      // If a booking exists, then the current user has applied to this event
      if(this.userBooking != null) {
        this.hasApplied = true;
      } else {
        this.hasApplied = false;
      }
      // If they haven't applied to this event, change the application text if it's negotiable
      if (!this.hasApplied) {
        if (this.model.negotiable) {
          this.buttonText = "Bid";
        }
      }
    })
  }

  /*
  Takes user to their performances
  */
 onManageBooking() {
    this.router.navigate(['/bookingmanagement/myperformances']); 
  }

  messageHost(){
    let message:Message = {
      to: this.model.hostUser
    };
    // If the user clicked message to some other user, then initiate conversation with it
    this._sharedDataService.setProfileMessageSharedProperties(this.user);
    this.router.navigate(['/chat']);
  }

  commentToHost(comment: string): Message {
    let message:Message = {
      to: this.model.hostUser,
      from: this.userService.user,
      content: comment,
      action: Action.SEND_PRIVATE_MSG,
      isRead: false,    
      sentAt: new Date(Date.now()),
      messageType: MessageTypes.MSG
    }
    return message;
  }

  onSelectHost(){
    if(this.isCurrentUser){
      this.router.navigate(['/profile'])
    }else{
      this.router.navigate(['/profile', this.model.hostUser._id])
    }
  }

  onEditEvent() {
    this.router.navigate(['/events', 'update', this.model._id]); //this will go to the page about the event
  }

  onDeleteEvent() {
    this.eventService.deleteEventByEID(this.model).then((status: Number) => {
      if (status == 200) {
        this.router.navigate(['/profile']);
        this.model = null;
      }
    });
  }

  newApplication() {
    this.userBooking = new Booking(undefined, BookingType.artistApply, this.model.hostUser, this.userService.user, this.model, false, false, false, StatusMessages.artistBid, StatusMessages.waitingOnHost, true, false, this.model.fixedPrice, null, null);
    this.bookingService.getArtistAvailability(this.userBooking).then((artistAvail: string) => {
      this.bookingService.negotiate(this.userBooking, true, "artist", artistAvail).subscribe((result) => {
        if (result != undefined) {
          if (result.response == NegotiationResponses.new) {
            this.userBooking.currentPrice = result.price;
            this.userBooking.hostViewed = false;
            this.userBooking.artViewed = true;
            this.bookingService.createBooking(this.userBooking).then((booking: Booking) => {
              // Flag application
              this.hasApplied = true;
              this.userBooking = booking;
              // Send notification to host
              let message = '';
              if(this.model.negotiable) {
                message = booking.performerUser.firstName + " has bid on your event called: " + booking.eventEID.eventName;
              } else {
                message = booking.performerUser.firstName + " has applied to your event called: " + booking.eventEID.eventName;
              }
              this.createNotificationForHost(booking, result.response, ['/bookingmanagement', 'myevents'],
              'queue_music', message);
              if(result.comment != null && result.comment != undefined) {
                let privateMessage: Message = this.commentToHost(result.comment);
                this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
              }
            });
          }
        }
      });
    });
  }

  createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(null, booking.performerUser, booking.hostUser, booking.eventEID._id,
      booking, response, message, icon, new Date(), route); 
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

}