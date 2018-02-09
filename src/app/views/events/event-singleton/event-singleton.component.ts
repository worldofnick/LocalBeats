import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from '@angular/common'
import { Router } from "@angular/router";


import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking, StatusMessages, NegotiationResponses } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'
import { SocketService } from '../../../services/chats/socket.service';
import { Message } from '../../../services/chats/model/message';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';

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
  public currentBookings: any[] = [];
  public approvedBookings: Booking[] = [];
  public dateInBar: Date;
  public zoom: number;
  public lat: number;
  public lng: number;
  EID: any;
  buttonText: string = "Apply";
  setLocation = false;

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    public datepipe: DatePipe
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
     
      this.user = event.hostUser;
      if (this.userService.user != null && this.user._id === this.userService.user._id) {
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    }).then(() => this.getBooking());

    //listening for real time notification
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        this.getBooking();
    });
  }

  getBooking() {
    this.bookingService.getBooking(this.model).then((bookings: any[]) => {
      this.currentBookings = bookings;
      if(this.currentBookings.length != 0) {
        for (let result of this.currentBookings) {
          if (result.approved) {
            this.approvedBookings.push(result)
          }
          if (this.userService.user != null && result.performerUser._id === this.userService.user._id) {
            this.hasApplied = true;
            this.userBooking = result
          }
        }
      } else {
        this.userBooking = null;
        this.hasApplied = false;
      }
      
      if (!this.hasApplied) {
        if (this.model.negotiable) {
          this.buttonText = "Bid";
        } else {
          this.buttonText = "Apply";
        }
      } else if(this.userBooking.approved){
        this.buttonText = "Cancel Booking";
      } else {
        this.buttonText = "View Application";
      }
    })

  }


  messageHost(){
    let message:Message = {
      to: this.model.hostUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  //cancel your application. NOT BEING CALLED BUT PROBABLY IS ACTUALLY BEING CALLED
  onCancelApp() {
    this.bookingService.declineBooking(this.userBooking).then(() => {
      this.hasApplied = false;
      this.userBooking = null
    })
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

  openNegotiationDialog() {
    let booking = new Booking(undefined, 'artist-apply', this.model.hostUser, this.userService.user, this.model, false, false, false, StatusMessages.artistBid, StatusMessages.waitingOnHost, false, true, false, this.model.fixedPrice);
    this.bookingService.negotiate(booking, true)
      .subscribe((result) => {
        if (result != undefined) {
          booking.currentPrice = result.price;
          if (result.response == NegotiationResponses.accept || result.response == NegotiationResponses.new) {
            booking = new Booking(undefined, 'artist-apply', this.model.hostUser, this.userService.user, this.model, false, false, false, StatusMessages.artistBid, StatusMessages.waitingOnHost,false, true, false, result.price);
            if(!this.model.negotiable) {
              booking.hostStatusMessage = StatusMessages.artistApplication;
            }
            this.bookingService.createBooking(booking).then((booking: Booking) => {
              //send notification to host that the artist has applied
              if(!booking.eventEID.negotiable){
                this.createNotificationForHost(booking, result.response, ['/events', 'events'],
                'event_available', booking.performerUser.firstName + " has applied for your event, " + booking.eventEID.eventName);
              }else{
                this.createNotificationForHost(booking, result.response, ['/profile', 'events'],
                  'event_available', booking.performerUser.firstName + " has bid on your event, " + booking.eventEID.eventName);
              }
              this.hasApplied = true;
              this.userBooking = booking;
              this.buttonText = "View Application";
            });
          } else {
            if (this.model.negotiable) {
              this.buttonText = "Bid";
            } else {
              this.buttonText = "Apply";
            }
            if (this.userBooking != null) {
              this.onCancelApp();
            }
          }
        }

      });
  }

  viewApplication() {
    this.bookingService.negotiate(this.userBooking, false)
      .subscribe((result) => {
        if (result != undefined) {
          this.userBooking.currentPrice = result.price;
          if (result.response == NegotiationResponses.accept) {
            this.userBooking.artistApproved = true;
            if (this.userBooking.hostApproved) {
              this.userBooking.approved = true;
              this.userBooking.hostStatusMessage = StatusMessages.bookingConfirmed;
              this.userBooking.artistStatusMessage = StatusMessages.bookingConfirmed;
              this.bookingService.acceptBooking(this.userBooking).then(() => {

                this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
                'event_available', this.userBooking.performerUser.firstName + " has confirmed " + this.userBooking.eventEID.eventName);
                this.hasApplied = true;
                this.buttonText = "Cancel Booking";
              })
            } else {
              this.bookingService.updateBooking(this.userBooking).then((booking: Booking) => {
                //no notification needs to be sent.
                this.hasApplied = true;
                this.userBooking = booking;
                this.buttonText = "View Application";
              });
            }
          } else if (result.response == NegotiationResponses.new) {
            this.userBooking.hostApproved = false;
            this.userBooking.artistApproved = true;
            this.userBooking.artistStatusMessage = StatusMessages.waitingOnHost;
            this.userBooking.hostStatusMessage = StatusMessages.artistBid;
            this.bookingService.updateBooking(this.userBooking).then((booking: Booking) => {
              //send notification to host because artist has changed the price
              this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
                'import_export', this.userBooking.performerUser.firstName + " has updated the offer on " + this.userBooking.eventEID.eventName);
              this.hasApplied = true;
              this.userBooking = booking;
              this.buttonText = "View Application";
            });
          } else if (result.response == NegotiationResponses.cancel || result.response == NegotiationResponses.decline){
            if (this.model.negotiable) {
              this.buttonText = "Bid";
            } else {
              this.buttonText = "Apply";
            }
            if (this.userBooking != null) {
              if (result.response == NegotiationResponses.cancel) {
                this.bookingService.declineBooking(this.userBooking).then(() => {
                  //send notification to host that the artist has cancelled an already confirmed booking.
                  this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
                  'event_busy', this.userBooking.performerUser.firstName + " has cancelled the confirmed booking for " + this.userBooking.eventEID.eventName);
                  this.hasApplied = false;
                  this.userBooking = null
                });
              } else if (result.response == NegotiationResponses.decline) {
                this.bookingService.declineBooking(this.userBooking).then(() => {
                  //send notification to the host that the artist has cancelled a bid
                  this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
                'event_busy', this.userBooking.performerUser.firstName + " has declined the offer on " + this.userBooking.eventEID.eventName);
                  this.hasApplied = false;
                  this.userBooking = null
                });
              }

            }
          }
        }
      });
  }

  createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(booking.performerUser, booking.hostUser, booking.eventEID._id,
      booking, response, message, icon, route); 
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }
}