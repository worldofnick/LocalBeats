import { Component, OnInit, Input } from '@angular/core';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';
import { User } from '../../../models/user';
import { Booking } from '../../../models/booking';
import { Event } from '../../../models/event';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'

@Component({
  selector: 'app-profile-request',
  templateUrl: './profile-request.component.html',
  styleUrls: ['./profile-request.component.css']
})
export class ProfileRequestComponent implements OnInit {

  @Input() user: User;
  @Input() artist: User;
  events: any[] = [];
  requestedBookings: any[] = [];
  deleteStatus: Number;
  artistID: any;

  constructor(private eventService: EventService, private userService: UserService,
    private bookingService: BookingService, private _socketService: SocketService) { }

  ngOnInit() {
    this.getAvailableEvents()
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
        this.requestedBookings = bookings;
      }));
  }

  //solely fo creating new requests. no cancellations.
  newRequest(event: Event) {
    let booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, true, event.fixedPrice);
    this.bookingService.negotiate(booking, true, 'host').subscribe((result) => {
      if (result != undefined) {
        if (result.accepted == 'accepted' || result.accepted == 'new') {
          booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, true, result.price);


          let notification = new Notification(); // build notification "someone has requested you to play blah"
          notification.receiverID = booking.performerUser;
          notification.senderID = booking.hostUser;
          notification.message = booking.hostUser.firstName + " has requested you for an event";

          notification.icon = 'queue_music';
          notification.eventID = booking.eventEID._id;
          notification.route = ['/events', notification.eventID]
          console.log("passing this notif to server");
          console.log(notification)
          this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);

          this.bookingService.createBooking(booking).then((booking: Booking) => this.getAvailableEvents());
        }
      }
    });
  }

  createNotification(booking:Booking) {
    let notification = new Notification(); // build notification "someone has requested you to play blah"
    notification.receiverID = booking.performerUser;
    notification.senderID = booking.hostUser;
    notification.message = booking.hostUser.firstName + " has cancelled the request";

    notification.icon = 'error';
    notification.eventID = booking.eventEID._id;
    notification.route = ['/events', notification.eventID]
    console.log("passing this notification to server");
    console.log(notification)
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

  viewRequest(booking: Booking) {
    this.bookingService.negotiate(booking, false, 'host').subscribe((result) => {
      if (result != undefined) {
        booking.currentPrice = result.price;
        if (result.accepted == 'accepted') {
          //
          booking.hostApproved = true;

          if (booking.artistApproved == true) {
            booking.approved = true;
            //now there is a confirmed booking.
            //send notification to the artist that the Host has accpeted the booking. 
            this.bookingService.acceptBooking(booking).then(() => this.getAvailableEvents());
          } else {
            //the host has viewed the request - not changed it - and accepted. - no notification needed here.
            this.bookingService.updateBooking(booking).then(() => this.getAvailableEvents());
          }

        } else if (result.accepted == 'new') {
          //price has changed. send notification to artist that the host has updated the price. 
          booking.hostApproved = true;
          booking.artistApproved = false;
          this.bookingService.updateBooking(booking).then(() => this.getAvailableEvents());
        } else {


          let notification = new Notification(); // build notification "someone has requested you to play blah"
          notification.receiverID = booking.performerUser;
          notification.senderID = booking.hostUser;
          notification.message = booking.hostUser.firstName + " has cancelled the request";

          notification.icon = 'error';
          notification.eventID = booking.eventEID._id;
          notification.route = ['/events', notification.eventID]
          console.log("passing this notification to server");
          console.log(notification)
          this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);


          this.bookingService.declineBooking(booking).then((booking: Booking) => this.getAvailableEvents());
        }
      }
    });
  }

}
