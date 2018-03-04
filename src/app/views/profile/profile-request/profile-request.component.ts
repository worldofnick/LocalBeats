// Angular Modules
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { MatTabChangeEvent } from '@angular/material';

// Services
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';

// Data Models
import { User } from '../../../models/user';
import { Booking, StatusMessages, NegotiationResponses, BookingType } from '../../../models/booking';
import { Event } from '../../../models/event';
import { Action } from '../../../services/chats/model/action';
import { SocketEvent } from '../../../services/chats/model/event';
import { Notification } from '../../../models/notification';
import { PaymentStatus } from '../../../models/payment';
import { Message } from '../../../services/chats/model/message';
import { MessageTypes } from '../../../services/chats/model/messageTypes';

@Component({
  selector: 'app-profile-request',
  templateUrl: './profile-request.component.html',
  styleUrls: ['./profile-request.component.css']
})
export class ProfileRequestComponent implements OnInit {
  private socketSubscription: ISubscription;
  private negotiationSubscription: ISubscription;

  // User Model
  @Input() user: User;

  // Artist Model which the user is viewing
  @Input() artist: User;

  // Hosted Events of the User Model
  hostedEvents: {
    availableEvents: Event[]
  };

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private _socketService: SocketService
  ) {
    this.hostedEvents = { 
      availableEvents: []
    }
  }

  ngOnInit() {
    this.getAvailableEvents();
    this.socketSubscription = this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        this.updateModel(notification.booking, notification.response);
    });
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    if(this.negotiationSubscription) {
      this.negotiationSubscription.unsubscribe();
    }
  }

  private getAvailableEvents() {
    // Get all events for the current user
    // Loop through the bookings and see which bookings exist for the selected artist
    let tempEventIds: String[] = [];;
    let tempEvents: Event[] = [];
    let potentialEvents: Event[] = [];
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      potentialEvents = events;
    }).then(() => this.bookingService.getUserBookings(this.user, 'host').then((bookings: Booking[]) => {
      for (let booking of bookings) {
        if (booking.performerUser._id == this.artist._id && !booking.cancelled) {
          // The user has booking with this person for this event
          tempEventIds.push(booking.eventEID._id);
        }
      }
      // Remove those event ids from available events
      for (let event of potentialEvents) {
        let found = false;
        for (let tempEventId of tempEventIds) {
          if (tempEventId == event._id) {
            found = true;
          }
        }
        if(!found) {
          tempEvents.push(event);
        }
      }
    this.hostedEvents.availableEvents = tempEvents;
    }));
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let eventIndex: number = -1;
    if(response == NegotiationResponses.new) {
      // Remove from available events
      eventIndex = this.hostedEvents.availableEvents.findIndex(e => e._id == newBooking.eventEID._id);
      this.hostedEvents.availableEvents.splice(eventIndex, 1);
    } else if (response == NegotiationResponses.cancel || response == NegotiationResponses.decline) {
      // Add event to available events 
      this.hostedEvents.availableEvents.push(newBooking.eventEID);
    }
  }

  newRequest(event: Event, eventIndex: number) {
    let tempBooking = new Booking(undefined, BookingType.hostRequest, event.hostUser, this.artist, event, false, false, false, StatusMessages.waitingOnArtist, StatusMessages.hostOffer, false, true, event.fixedPrice, null, null);
    if(this.negotiationSubscription) {
      this.negotiationSubscription.unsubscribe();
    }
    this.negotiationSubscription = this.bookingService.negotiate(tempBooking, true, "host").subscribe((result) => {
      if (result != undefined) {
        if (result.response == NegotiationResponses.new) {
          tempBooking.currentPrice = result.price;
          this.bookingService.createBooking(tempBooking).then((booking: Booking) => {
            // Remove from available events
            this.hostedEvents.availableEvents.splice(eventIndex, 1);
            // Send notification to artist
            this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id], 
          'queue_music', booking.hostUser.firstName + " has requested you for an event called: " + booking.eventEID.eventName);
          if(result.comment != '') {
            let privateMessage: Message = this.commentToArtist(result.comment, booking);
            this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
          }
          });
        }
      }
    });
  }

  commentToArtist(comment: string, booking: Booking): Message {
    let message:Message = {
      to: booking.performerUser,
      from: this.userService.user,
      content: comment,
      action: Action.SEND_PRIVATE_MSG,
      isRead: false,    
      sentAt: new Date(Date.now()),
      messageType: MessageTypes.MSG
    }
    return message;
  }

  createNotificationForArtist(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(booking.hostUser, booking.performerUser, booking.eventEID._id,
      booking, response, message, icon, route);
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

}
