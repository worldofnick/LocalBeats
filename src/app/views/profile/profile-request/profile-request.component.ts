import { Component, OnInit, Input } from '@angular/core';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';
import { User } from '../../../models/user';
import { Booking, StatusMessages } from '../../../models/booking';
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
  confirmedBookings: any[] = [];
  deleteStatus: Number;
  artistID: any;

  constructor(private eventService: EventService, private userService: UserService,
    private bookingService: BookingService, private _socketService: SocketService) { }

  ngOnInit() {
    this.getAvailableEvents()

    //listening for real time notification
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        this.getAvailableEvents();
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
        this.requestedBookings = [];
        this.confirmedBookings = [];
        for (let result of bookings) {
          if (result.bookingType == 'host-request') {
            if(!result.approved) {
              this.requestedBookings.push(result);
            } else {
              this.confirmedBookings.push(result);
            }
  
          } else if (result.bookingType == 'artist-apply') {
            if(!result.approved){
              this.requestedBookings.push(result);
            } else {
              this.confirmedBookings.push(result);
            }
          }
        }
        this.events = tempEvents;
      }));
  }

  //solely fo creating new requests. no cancellations.
  newRequest(event: Event) {
    let booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, '', '', false, false, true, event.fixedPrice);
    this.bookingService.negotiate(booking, true, 'host').subscribe((result) => {
      if (result != undefined) {
        if (result.accepted == 'accepted' || result.accepted == 'new') {
          booking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, StatusMessages.waitingOnArtist, StatusMessages.hostOffer, false, false, true, result.price);

          this.createNotification(booking, ['/events', booking.eventEID._id], 
          'queue_music', booking.hostUser.firstName + " has requested you for an event called: " + booking.eventEID.eventName);

          this.bookingService.createBooking(booking).then((booking: Booking) => this.getAvailableEvents());
        }
      }
    });
  }

  //sends notification to artist
  createNotification(booking: Booking, route: string[], icon: string, message: string) {
    let notification = new Notification(); // build notification "someone has requested you to play blah"
    notification.receiverID = booking.performerUser;
    notification.senderID = booking.hostUser;
    notification.eventID = booking.eventEID._id;
    notification.message = message;
    notification.icon = icon;
    notification.route = route
    // console.log("passing this notification to server");
    // console.log(notification)
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
            booking.hostStatusMessage = StatusMessages.bookingConfirmed;
            booking.artistStatusMessage = StatusMessages.bookingConfirmed;
            this.bookingService.acceptBooking(booking).then(() => {
              //now there is a confirmed booking.
              //send notification to the artist that the Host has accpeted the booking. 
              this.createNotification(booking, ['/events', booking.eventEID._id], 
          'event_availble', booking.hostUser.firstName + " has accepted the request for " + booking.eventEID.eventName);
              this.getAvailableEvents()
            });
          } else {
            this.bookingService.updateBooking(booking).then(() => {
              //the host has viewed the request - not changed it - and accepted. - no notification needed here.

              this.getAvailableEvents()});
          }

        } else if (result.accepted == 'new') {
          booking.hostApproved = true;
          booking.artistApproved = false;
          booking.hostStatusMessage = StatusMessages.waitingOnArtist;
          booking.artistStatusMessage = StatusMessages.hostOffer;
          this.bookingService.updateBooking(booking).then(() => {
          //price has changed. send notification to artist that the host has updated the price. 
          this.createNotification(booking, ['/events', booking.eventEID._id],
        'import_export', booking.hostUser.firstName + " has updated the offer on " + booking.eventEID.eventName);
          this.getAvailableEvents()
        });
        } else if(result.accepted == 'cancel' || result.accepted == 'declined'){

          this.bookingService.declineBooking(booking).then((booking2: Booking) => {
            //send notifcaiotn cancellation here
            //made this boking2 because i dont think decline booking actually returns a booking.
            this.createNotification(booking, ['/events', booking.eventEID._id], 
            'event_busy', booking.hostUser.firstName + " has cancelled the request on " + booking.eventEID.eventName);
            this.getAvailableEvents()

          });
        }
      }
    });
  }

}
