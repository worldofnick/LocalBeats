import { Component, OnInit, Input } from '@angular/core';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { Booking } from '../../../models/booking';
import { Event } from '../../../models/event';

@Component({
  selector: 'app-profile-request',
  templateUrl: './profile-request.component.html',
  styleUrls: ['./profile-request.component.css']
})
export class ProfileRequestComponent implements OnInit {

  @Input() user: User;
  @Input() artist: User;
  events:any[];
  requestedEvents:any[] = [];
  deleteStatus:Number;
  artistID:any;

  constructor(private eventService: EventService, private userService: UserService, private bookingService: BookingService) { }

  ngOnInit() {
    this.getAvailableEvents()
  }

  onRequestEvent(event:Event){
    const booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, true, event.fixedPrice);
    this.bookingService.createBooking(booking).then((booking: Booking) => this.getAvailableEvents());
  }

  onCancelRequest(event:Event) {
    this.bookingService.getBooking(event).then((bookings: any[]) => {
      for (let result of bookings) {
        if (result.eventEID._id == event._id && result.performerUser._id == this.artist._id) {
          this.bookingService.declineBooking(result).then(() => this.getAvailableEvents())
        }
      }
    });
  }

  public getAvailableEvents() {
    // Get all bookings for the current user
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.events = events;   
    }).then(() =>
    this.bookingService.getUserBookings(this.userService.user, 'host').then((bookings: any[]) => {
      // Loop through the bookings and see if a booking exists for the selected artist
      let tempEventIds: String[] = [];
      for (let result of bookings) {
        if (result.performerUser._id == this.artist._id) {
          tempEventIds.push(result.eventEID._id);
        }
      }
      // If so, remove those event ids from event list
      let tempEvents: any[] = [];
      let tempRequestedEvents: any[] = [];
      for (let event of this.events) {
        let found = false
        for (let tempEventId of tempEventIds) {
          if (tempEventId == event._id) {
            found = true;
            tempRequestedEvents.push(event)
          }
        }
        if (found == false) {
          tempEvents.push(event)
        }
      }
      this.events = tempEvents;
      this.requestedEvents = tempRequestedEvents
    }));
  }

  openNegotiationDialog(event: Event) {
    let booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, true, event.fixedPrice);
    this.bookingService.negotiate(booking, 'host').subscribe((result) => {
      if(result.accepted == 'accepted' || result.accepted == 'new') {
        console.log('here')
        console.log(result);
        booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, true, result.price);
        this.bookingService.createBooking(booking).then((booking: Booking) => this.getAvailableEvents());
      } else {
        this.onCancelRequest(event);
      }
    });
  }

}
