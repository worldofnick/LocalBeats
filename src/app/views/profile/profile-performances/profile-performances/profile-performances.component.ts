import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";

import { UserService } from '../../../../services/auth/user.service';
import { BookingService } from '../../../../services/booking/booking.service';
import { EventService } from '../../../../services/event/event.service';
import { User } from '../../../../models/user';
import { Event } from '../../../../models/event';
import { Booking, StatusMessages, NegotiationResponses } from '../../../../models/booking';
import { Action } from '../../../../services/chats/model/action'
import { SocketEvent } from '../../../../services/chats/model/event'
import { Notification } from '../../../../models/notification'
import { SocketService } from 'app/services/chats/socket.service';

@Component({
  selector: 'app-profile-performances',
  templateUrl: './profile-performances.component.html',
  styleUrls: ['./profile-performances.component.css']
})
export class ProfilePerformancesComponent implements OnInit {
  user:User = new User;
  events: any[];
  requestedArtistBookings: Booking[];
  appliedBookings: Booking[];
  confirmedBookings: Booking[];
  deleteStatus:Number;
  hasApplied:Boolean = true;

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

  onViewEvent(event:Event){
    this.router.navigate(['/events', event._id]); //this will go to the page about the event
  }
  public getEvents() {
    this.requestedArtistBookings = [];
    this.appliedBookings = [];
    this.confirmedBookings = [];
    this.events = [];
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      for(let e of events) {
        this.bookingService.getBooking(e).then((bookings: Booking[]) => {
          let applicants: any[] = [];
          let approved: any[] = [];
          for(let booking of bookings) {
            if(booking.approved) {
              approved.push(booking);
            } else {
              applicants.push(booking);
            }
          }
          this.events.push({event: e, applicants: applicants, approved: approved});
        })
      }
      // Then get the bookings where the current user is the artist 
    }).then(() => this.bookingService.getUserBookings(this.userService.user, 'artist').then((bookings: any[]) => {
      let tempappliedEventsId: string[] = []
      let tempRequestArtistEventId: string[] = []
      for (let result of bookings) {
        if (result.bookingType == 'host-request') {
          if(!result.approved) {
            this.requestedArtistBookings.push(result);
          } else {
            this.confirmedBookings.push(result);
          }

        } else if (result.bookingType == 'artist-apply') {
          if(!result.approved){
            this.appliedBookings.push(result);
          } else {
            this.confirmedBookings.push(result);
          }
        }
      }
    }));

  }

  onEditEvent(event:Event){
    this.router.navigate(['/events', 'update', event._id]); //this will go to the page about the event        
  }


  viewApplicants(event: Event) {
    this.eventService.event = event;
    this.router.navigate(['/applicant-list', event._id]);  
  }

  openNegotiationDialog(booking: Booking, user:string) {
    this.bookingService.negotiate(booking, false)
      .subscribe((result) => {
        if(result != undefined) {
          booking.currentPrice = result.price;
          if(result.response == NegotiationResponses.accept) {
            booking.artistApproved = true;
            if(booking.hostApproved == true) {
              booking.approved = true;
              booking.hostStatusMessage = StatusMessages.bookingConfirmed;
              booking.artistStatusMessage = StatusMessages.bookingConfirmed;
              this.bookingService.acceptBooking(booking).then(() => {
                //send notification to both parties that the booking has been confirmed. \
                //redirect artist to their performances page.
                //if it is the host notification then redirect to their my events page

                this.createNotificationForHost(booking, result.response, ['/profile', 'events'],
                'event_available', "You have confirmed " + booking.eventEID.eventName);
                this.getEvents()
              });
            } else {
              this.bookingService.updateBooking(booking).then((tempBooking:Booking) => {
                //dont send a notification.
                this.getEvents()});
            }
          } else if(result.response == NegotiationResponses.new) {
              booking.hostApproved = false;
              booking.artistApproved = true;
              booking.hostStatusMessage = StatusMessages.artistBid;
              booking.artistStatusMessage = StatusMessages.waitingOnHost;
              this.bookingService.updateBooking(booking).then((tempBooking: Booking) => {
                //send a notification to the host that an artist has applied for an event. 
                this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
                'import_export', booking.performerUser.firstName + " has updated the offer on " + booking.eventEID.eventName);
                this.getEvents()
              });
          } else if(result.response == NegotiationResponses.cancel) {
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to host that the artist has cancelled an already confirmed booking.
              this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
              'event_busy', booking.performerUser.firstName + " has cancelled the confirmed booking for" + booking.eventEID.eventName);
              this.getEvents()
            });
          }else if(result.response == NegotiationResponses.decline){
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to host that the artist has declined an offer
              this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
              'event_busy', booking.performerUser.firstName + " has cancelled the request on" + booking.eventEID.eventName);
              this.getEvents()
            });

          }
        }
      });
  }

    createNotificationForArtist(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
      let notification = new Notification(booking.hostUser, booking.performerUser, booking.eventEID._id,
      booking, response, message, icon, route); 
      this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
    }
  
    createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
      let notification = new Notification(booking.performerUser, booking.hostUser, booking.eventEID._id,
      booking, response, message, icon, route); 
      this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
    }

}
