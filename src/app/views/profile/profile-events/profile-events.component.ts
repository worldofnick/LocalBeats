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
  user:User;
  events:any[];
  requestedArtistEvents: any[] = [];
  requestedArtistBookings: any[] = [];
  appliedEvents: Event[] = [];
  appliedBookings: any[] = [];
  deleteStatus:Number;

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
      console.log(this.deleteStatus);
      if(this.deleteStatus == 200){
        //remove event from events[]
        // console.log("printing events before deletion:");
        // console.log(this.events);
        
        var newEvents:Event[] = [];

        //go thru and push all events except the deleted one to the new event.
        for(let i:number = 0; i < this.events.length; i++){
          if(i != index){
            newEvents.push(this.events[i]);
          }
        }

        this.events = newEvents;
        
        // console.log("printing events after deletion:");
        // console.log(this.events);

      }
    });

    if(this.events.length <= 5){
      this.getEvents();
    }

  }

  onDeclineArtist(event:Event, index: number){
    this.bookingService.declineBooking(this.requestedArtistBookings[index]).then(() => this.getEvents());
  }

  onAcceptArtist(event:Event, index: number){
    this.bookingService.acceptBooking(this.requestedArtistBookings[index]).then(() => this.getEvents());
  }

  onCancelRequest(event:Event, index: number) {
    this.bookingService.declineBooking(this.appliedBookings[index]).then(() => this.getEvents());
  }

  public getEvents() {
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.events = events; 
      this.requestedArtistBookings = [];
      this.requestedArtistEvents = [];
      this.appliedEvents = [];
      this.appliedBookings = [];  
      // this.eventService.events = this.events;   
    }).then(() => this.bookingService.getUserBookings(this.userService.user, 'artist').then((bookings: any[]) => {
      console.log(bookings);
      // Where the current user is the requested artist
      let tempappliedEventsId: string[] = []
      let tempRequestArtistEventId: string[] = []
      for (let result of bookings) {
        console.log('user bookings:')
        console.log(result)
        if (result.bookingType == 'host-request') {
          tempRequestArtistEventId.push(result.eventEID._id);
          this.requestedArtistBookings.push(result);
        } else if (result.bookingType == 'artist-apply') {
          tempappliedEventsId.push(result.eventEID._id);
          this.appliedBookings.push(result);
        }
      }
      for (let id of tempappliedEventsId) {
        let temp = { 'id': id}
        this.eventService.getEventByEID(temp).then((event: Event) => {
          this.appliedEvents.push(event);
        });
      }
      console.log('Applied Events:')
      console.log(this.appliedEvents)

      for (let id of tempRequestArtistEventId) {
        let temp = { 'id': id}
        this.eventService.getEventByEID(temp).then((event: Event) => {
          this.requestedArtistEvents.push(event);
        });
      }

      console.log('My Events');
      console.log(this.events)
    }));

  }

  onEditEvent(event:Event){
    this.router.navigate(['/events', 'update', event._id]); //this will go to the page about the event        
  }

  onPickEvent(event:Event){
    // this.model = event;      
    this.eventService.event = event;
    this.router.navigate(['/event-page', event._id]); //this will go to the page about the event    
  }

  viewApplicants(event: Event) {
    this.eventService.event = event;
    this.router.navigate(['/applicant-list', event._id]);  
  }

}
