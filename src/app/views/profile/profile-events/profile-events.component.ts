import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";


import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking } from '../../../models/booking';

@Component({
  selector: 'app-profile-events',
  templateUrl: './profile-events.component.html',
  styleUrls: ['./profile-events.component.css']
})
export class ProfileEventsComponent implements OnInit {
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
    private router: Router
    ) { }

  ngOnInit() {
    this.user = this.userService.user;
    this.getEvents();
  }


  onDeleteEvent(event:Event, index:Number){
    this.eventService.deleteEventByEID(event).then((status:Number) => {
      this.deleteStatus = status;
      if(this.deleteStatus == 200){
        var newEvents:Event[] = [];
        for(let i:number = 0; i < this.events.length; i++){
          if(i != index){
            newEvents.push(this.events[i]);
          }
        }
        this.events = newEvents;
      }
    });

    if(this.events.length <= 5){
      this.getEvents();
    }

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
    this.bookingService.negotiate(booking, false, 'host')
      .subscribe((result) => {
        if(result != undefined) {
          booking.currentPrice = result.price;
          if(result.accepted == 'accepted') {
            booking.hostApproved = true;
            if(booking.artistApproved == true) {
              booking.approved = true;
              this.bookingService.acceptBooking(booking).then(() => {
                //send notification to BOTH users that the booking is confirmed 
                this.getEvents()
              });
            } else {
              this.bookingService.updateBooking(booking).then(() => {
                //dont send notification. host is accepting in dialog.
                this.getEvents()
              });
            }
          } else if(result.accepted == 'new') {
              booking.hostApproved = true;
              booking.artistApproved = false;
              this.bookingService.updateBooking(booking).then(() => {
                //send notificaiton to the artist that the event host has made a new offer.
                this.getEvents()
              });
          } else if(result.accepted == 'cancel') {
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to artist that the host has cancelled an already confirmed booking.
              this.getEvents()
            });
          }else if (result.accepted == 'declined'){
            this.bookingService.declineBooking(booking).then(() => {
              //send notification to the artist that the host has cancelled an offer
              this.getEvents()
            });
          }
        }
      });
  }

}
