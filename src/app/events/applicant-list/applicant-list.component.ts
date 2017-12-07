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
  selector: 'app-applicant-list',
  templateUrl: './applicant-list.component.html',
  styleUrls: ['./applicant-list.component.css']
})
export class ApplicantListComponent implements OnInit {

  public model:Event;
  public user:User;
  public currentBookings: any[];
  public approvedBookings: Booking[];

  EID:any;

  constructor(private bookingService: BookingService, private eventService: EventService, private userSerivce: UserService, private router: Router, private route: ActivatedRoute) {
  }



  ngOnInit() {

    this.EID = {
      id: this.route.snapshot.params['id']
    }

    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
      this.user = event.hostUser;
    }).then(() => this.bookingService.getBooking(this.model).then((bookings: Booking[]) => {
      this.currentBookings = bookings;
      console.log("printing bookings from appllicant list");
      console.log(this.currentBookings);
      for (let result of this.currentBookings) {
        if (result.booking.approved) {
          this.approvedBookings.push(result.booking)
        }
      }
    }));


  }

  /**
   * both of these are passed result.booking
   */
  onDeclineArist(booking:Booking){

  }

  onAcceptArtist(booking:Booking){

  }

  /**
   * passed result.booking.performerUser._id
   */
  onClickArtist(ID:string){
    this.router.navigate(['/profile', ID]);        
    
  }

}
