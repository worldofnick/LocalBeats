import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";


import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking, StatusMessages } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'
import { SocketService } from 'app/services/chats/socket.service';

@Component({
  selector: 'app-profile-events',
  templateUrl: './profile-events.component.html',
  styleUrls: ['./profile-events.component.css']
})
export class ProfileEventsComponent implements OnInit {
  user: User = new User;
  events: any[];
  requestedArtistBookings: Booking[];
  appliedBookings: Booking[];
  confirmedBookings: Booking[];
  deleteStatus: Number;
  hasApplied: Boolean = true;

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService
  ) { }

  ngOnInit() {
    this.user = this.userService.user;
    this.getEvents();

    //listening for real time notification
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        this.getEvents();
    });
  }


  onDeleteEvent(event: Event, index: Number) {
    this.eventService.deleteEventByEID(event).then((status: Number) => {
      this.deleteStatus = status;
      if (this.deleteStatus == 200) {
        var newEvents: Event[] = [];
        for (let i: number = 0; i < this.events.length; i++) {
          if (i != index) {
            newEvents.push(this.events[i]);
          }
        }
        this.events = newEvents;
      }
    });

    if (this.events.length <= 5) {
      this.getEvents();
    }

  }

  onViewEvent(event: Event) {
    this.router.navigate(['/events', event._id]); //this will go to the page about the event
  }
  public getEvents() {
    this.requestedArtistBookings = [];
    this.appliedBookings = [];
    this.confirmedBookings = [];
    this.events = [];
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      for (let e of events) {
        this.bookingService.getBooking(e).then((bookings: Booking[]) => {
          let applicants: any[] = [];
          let approved: any[] = [];
          for (let booking of bookings) {
            if (booking.approved) {
              approved.push(booking);
            } else {
              applicants.push(booking);
            }
          }
          this.events.push({ event: e, applicants: applicants, approved: approved });
        })
      }
      // Then get the bookings where the current user is the artist 
    }).then(() => this.bookingService.getUserBookings(this.userService.user, 'artist').then((bookings: any[]) => {
      let tempappliedEventsId: string[] = []
      let tempRequestArtistEventId: string[] = []
      for (let result of bookings) {
        if (result.bookingType == 'host-request') {
          if (!result.approved) {
            this.requestedArtistBookings.push(result);
          } else {
            this.confirmedBookings.push(result);
          }

        } else if (result.bookingType == 'artist-apply') {
          if (!result.approved) {
            this.appliedBookings.push(result);
          } else {
            this.confirmedBookings.push(result);
          }
        }
      }
    }));

  }

  onEditEvent(event: Event) {
    this.router.navigate(['/events', 'update', event._id]); //this will go to the page about the event        
  }


  viewApplicants(event: Event) {
    this.eventService.event = event;
    this.router.navigate(['/applicant-list', event._id]);
  }

  openNegotiationDialog(booking: Booking, user: string) {
    this.bookingService.negotiate(booking, false, 'host')
      .subscribe((result) => {
        if (result != undefined) {
          booking.currentPrice = result.price;
          if (result.accepted == 'accepted') {
            booking.hostApproved = true;
            if (booking.artistApproved == true) {
              booking.approved = true;
              booking.hostStatusMessage = StatusMessages.bookingConfirmed;
              booking.artistStatusMessage = StatusMessages.bookingConfirmed;
              this.bookingService.acceptBooking(booking).then(() => {
                //send notification to BOTH users that the booking is confirmed 
                this.createNotificationForArtist(booking, ['/profile', 'performances'],
                'event_available', booking.hostUser.firstName + " has confirmed the booking" + booking.eventEID.eventName);
                this.getEvents()
              });
            } else {
              this.bookingService.updateBooking(booking).then(() => {
                //dont send notification. host is accepting in dialog.
                this.getEvents()
              });
            }
          } else if (result.accepted == 'new') {
            booking.hostApproved = true;
            booking.artistApproved = false;
            booking.hostStatusMessage = StatusMessages.waitingOnArtist;
            booking.artistStatusMessage = StatusMessages.hostOffer;
            this.bookingService.updateBooking(booking).then(() => {
              //send notificaiton to the artist that the event host has made a new offer.
              this.createNotificationForArtist(booking, ['/events', booking.eventEID._id],
              'import_export', booking.hostUser.firstName + " has updated the offer on " + booking.eventEID.eventName);
              this.getEvents()
            });
          } else if (result.accepted == 'cancel') {
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to artist that the host has cancelled an already confirmed booking.
              this.createNotificationForArtist(booking, ['/events', booking.eventEID._id],
              'event_busy', booking.hostUser.firstName + " has cancelled the confirmed boking for " + booking.eventEID.eventName);
              this.getEvents()
            });
          } else if (result.accepted == 'declined') {
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to the artist that the host has cancelled an offer
              this.createNotificationForArtist(booking, ['/events', booking.eventEID._id],
              'event_busy', booking.hostUser.firstName + " has cancelled the request on " + booking.eventEID.eventName);
              this.getEvents()
            });
          }
        }
      });
  }

  //send to artist
  createNotificationForArtist(booking: Booking, route: string[], icon: string, message: string) {
    let notification = new Notification(); // build notification "someone has requested you to play blah"
    notification.receiverID = booking.performerUser;
    notification.senderID = booking.hostUser;
    notification.eventID = booking.eventEID._id;
    notification.message = message;
    notification.icon = icon;
    notification.route = route

    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

  //send to host
  createNotificationForHost(booking: Booking, route: string[], icon: string, message: string) {
    let notification = new Notification(); // build notification "someone has requested you to play blah"
    notification.receiverID = booking.hostUser;
    notification.senderID = booking.performerUser;
    notification.eventID = booking.eventEID._id;
    notification.message = message;
    notification.icon = icon;
    notification.route = route
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }
}
