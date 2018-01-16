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

  public model:Event;
  public user:User;
  public userBooking: Booking;
  public isCurrentUser: boolean = null;
  public hasApplied: boolean = null;
  public currentBookings: any[] = [];
  public approvedBookings: Booking[] = [];
  public dateInBar:Date;
  public dateString:any;
  deleteStatus:Number;
  

  EID:any;

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
      console.log(this.model);
      // this.dateString = this.model.fromDate.toDateString as string;
      // this.dateString =this.datepipe.transform(this.model.fromDate, 'MM-dd-yyyy');      // this.dateInBar = this.model.fromDate
      // console.log(this.model.fromDate.getDate);
      // console.log(this.model.fromDate.toDateString);
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
      console.log(this.approvedBookings);

      for(let result of this.approvedBookings){
        console.log(result);
        console.log(result.performerUser.firstName);
      }
    }));


  }

  onEditEvent(){
    console.log("editing event");
    console.log(this.model._id);

    this.router.navigate(['/events', 'update', this.model._id]); //this will go to the page about the event
    
  }

  onDeleteEvent(){
    console.log("deleting");
    console.log(this.model._id);
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

}