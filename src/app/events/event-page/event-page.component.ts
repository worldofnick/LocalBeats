import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { BookingService } from 'app/services/booking.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';
import { Booking } from 'app/models/booking';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css']
})
export class EventPageComponent implements OnInit {
  public model:Event;
  public user:User;
  public isCurrentUser: boolean = null;
  public hasApplied: boolean = null;
  public currentBookings: any[];
  public approvedBookings: Booking[];


  EID:any;

  constructor(private bookingService: BookingService, private eventService: EventService, private userSerivce: UserService, private router: Router, private route: ActivatedRoute) {

   }

  ngOnInit() {
    // this.isCurrentUser = false;
    // this.model = this.eventService.event;
    // this.user = this.userSerivce.user;
    // console.log("in ngonit in event page..printing data " );
    // console.log(this.model._id);
    this.EID = {
      id: this.route.snapshot.params['id']
    }

    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
      this.user = event.hostUser;
      if (this.userSerivce.user != null && this.user._id === this.userSerivce.user._id) {
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    }).then(() => this.bookingService.getBooking(this.model).then((bookings: any[]) => {
      this.currentBookings = bookings;
      for (let result of this.currentBookings) {
        if (result.booking.approved) {
          this.approvedBookings.push(result.booking)
        }
        // console.log("printing performer and user service user from event page");
        // console.log(booking);
        // console.log(this.userSerivce.user._id);
        if (this.userSerivce.user != null && result.booking.performerUser._id === this.userSerivce.user._id){
          this.hasApplied = true;
        }
      }
    }));
  }

  public applyToEvent(){
    const booking = new Booking(null, 'artist-apply', this.model.hostUser, this.userSerivce.user, this.model._id, false, false)
    this.bookingService.createBooking(booking).then((booking: Booking) => {
      this.hasApplied = true;
    })
  }

  public viewApplicants() {
    this.router.navigate(['/applicant-list', this.model._id]);        
  }

}
