import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
// import { DatePipe } from '@angular/common'
import { Router } from "@angular/router";


import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking } from '../../../models/booking';


@Component({
  selector: 'app-event-singleton',
  templateUrl: './event-singleton.component.html',
  styleUrls: ['./event-singleton.component.css']
})
export class EventSingletonComponent implements OnInit {

  public model:Event = new Event;
  public user:User = new User;
  public userBooking: Booking;
  public isCurrentUser: boolean = null;
  public hasApplied: boolean = null;
  public currentBookings: any[] = [];
  public approvedBookings: Booking[] = [];
  public dateInBar:Date;
  public dateString:any;
  deleteStatus:Number;
  EID:any;
  buttonText: string = "Apply";

  constructor(private eventService: EventService, 
              private userService: UserService,
              private bookingService: BookingService,
              private route: ActivatedRoute,
              private router: Router
              ) { }
  
  ngOnInit() {
    this.EID = {
      id: this.route.snapshot.params['id']
    }
    
    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
      
      this.user = event.hostUser;
      if (this.userService.user != null && this.user._id === this.userService.user._id) {
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    }).then(() => this.bookingService.getBooking(this.model).then((bookings: any[]) => {
      this.currentBookings = bookings;
      for (let result of this.currentBookings) {
        if (result.approved) {
          this.approvedBookings.push(result)
        }
        if (this.userService.user != null && result.performerUser._id === this.userService.user._id){
          this.hasApplied = true;
          this.userBooking = result
        }
      }
      if(!this.hasApplied) {
        if(this.model.negotiable) {
            this.buttonText = "Bid";
        } else {
          this.buttonText = "Apply";
        }
      } else {
        this.buttonText = "View Application";
      }
    }));
  }

  //apply to the event
  onApplyEvent(){
    const booking = new Booking(undefined, 'artist-apply', this.model.hostUser, this.userService.user, this.model, false, false, true, false, this.model.fixedPrice)
    this.bookingService.createBooking(booking).then((booking: Booking) => {
      this.hasApplied = true;
      this.userBooking = booking;
    })
  }


  //cancel your application
  onCancelApp(){
    this.bookingService.declineBooking(this.userBooking).then(() => {
      this.hasApplied = false;
      this.userBooking = null
    })
  }

  onViewApplications(){

  }

  onEditEvent(){
    this.router.navigate(['/events', 'update', this.model._id]); //this will go to the page about the event
    
  }

  onDeleteEvent(){
    this.eventService.deleteEventByEID(this.model).then((status:Number) => {
      this.deleteStatus = status;
      console.log(this.deleteStatus);
      if(this.deleteStatus == 200){
        // this.eventService.events = this.eventService.events.filter(e => e !== this.event);
        // this.router.navigate(['/profile']);
        this.model = null;        
      }
    });
  }

  openNegotiationDialog() {
    let booking = new Booking(undefined, 'artist-apply', this.model.hostUser, this.userService.user, this.model, false, false, false, false, this.model.fixedPrice);
    this.bookingService.negotiate(booking, true, 'artist')
      .subscribe((result) => {
        if(result.accepted == 'accepted' || result.accepted == 'new') {
          booking = new Booking(undefined, 'artist-apply', this.model.hostUser, this.userService.user, this.model, false, false, true, false, result.price);
          this.bookingService.createBooking(booking).then((booking: Booking) => {
            this.hasApplied = true;
            this.userBooking = booking;
            this.buttonText = "View Application";
          });
        } else {
          if(this.model.negotiable) {
            this.buttonText = "Bid";
          } else {
            this.buttonText = "Apply";
          }
          if(this.userBooking != null) {
            this.onCancelApp();
          }
        }

      });
  }

  viewApplication() {
    this.bookingService.negotiate(this.userBooking, false, 'artist')
      .subscribe((result) => {
        if(result.accepted == 'accepted' || result.accepted == 'new') {
          this.userBooking.currentPrice = result.price;
          this.userBooking.artistApproved = true;
          this.bookingService.updateBooking(this.userBooking).then((booking: Booking) => {
            this.hasApplied = true;
            this.userBooking = booking;
            this.buttonText = "View Application";
          });
        } else {
          if(this.model.negotiable) {
            this.buttonText = "Bid";
          } else {
            this.buttonText = "Apply";
          }
          if(this.userBooking != null) {
            this.onCancelApp();
          }
        }

      });
  }

}
