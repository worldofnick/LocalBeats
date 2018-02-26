// Angular Modules
import { Component, OnInit, Input } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';

// Services
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';

// Data Models
import { User } from '../../../models/user';
import { Booking, StatusMessages, NegotiationResponses } from '../../../models/booking';
import { Event } from '../../../models/event';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'
import { PaymentStatus } from '../../../models/payment'

@Component({
  selector: 'app-profile-request',
  templateUrl: './profile-request.component.html',
  styleUrls: ['./profile-request.component.css']
})
export class ProfileRequestComponent implements OnInit {

  // User Model
  @Input() user: User;

  // Artist Model which the user is viewing
  @Input() artist: User;

  // Hosted Events of the User Model
  hostedEvents: {
    availableEvents: Event[],
    applications: Booking[],
    applicationNotifications: number,
    requests: Booking[],
    requestNotifications: number,
    confirmations: Booking[],
    confirmationNotifications: number,
    paymentStatues: PaymentStatus[]};

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private _socketService: SocketService
  ) {
    this.hostedEvents = { 
      availableEvents: [],
      applications: [],
      applicationNotifications: 0,
      requests: [],
      requestNotifications: 0,
      confirmations: [],
      confirmationNotifications: 0,
      paymentStatues: []
    }
  }

  ngOnInit() {
    this.getAvailableEvents();
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        if (notification.response != NegotiationResponses.payment) {
          this.updateModel(notification.booking, notification.response);
        } else {
          this.updatePaymentStatues(notification.booking);
        }
    });
  }

  private updatePaymentStatues(booking: Booking) {
    let index = this.hostedEvents.confirmations.findIndex(b => b._id == booking._id);
    this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
      this.hostedEvents.paymentStatues[index] = status;
    });
  }

  private getAvailableEvents() {
    // Get all events for the current user
    // Loop through the bookings and see which bookings exist for the selected artist
    let tempEventIds: String[] = [];
    // Get the confirmed bookings
    let confirmedBookings: Booking[] = [];
    // Get the application bookings
    let applicationBookings: Booking[] = [];
    // Get the request bookings
    let requestBookings: Booking[] = [];
    let tempEvents: Event[] = [];
    // Get the notification counts
    let numNotif: number = 0;
    let reqNotif: number = 0;
    let numConf: number = 0;
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.hostedEvents.availableEvents = events;
    }).then(() => this.bookingService.getUserBookings(this.user, 'host').then((bookings: Booking[]) => {
      for (let booking of bookings) {
        if (booking.performerUser._id == this.artist._id) {
          tempEventIds.push(booking.eventEID._id);
          // Check what type of booking it is
          if(booking.approved) {
            confirmedBookings.push(booking);
            // If the booking is confirmed and has not yet been viewed by the host, a new notification exists
            this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
              this.hostedEvents.paymentStatues.push(status);
            });
            if(!booking.hostViewed) {
              numConf++;
            }
          } else {
            // Check to see if the artist applied
            if(booking.bookingType == 'artist-apply') {
              applicationBookings.push(booking);
              // If the booking is not confirmed and the artist has approved, a new notification exists
              if(booking.artistApproved) {
                numNotif++;
              }
            } else {
              // Otherwise, it was a host request
              requestBookings.push(booking);
              // If the booking is not confirmed and the artist has approved, a new notification exists
              if(booking.artistApproved) {
                reqNotif++;
              }
            }
          }
        }
      }
      // Remove those event ids from available events
      for (let event of this.hostedEvents.availableEvents) {
        let found = false
        for (let tempEventId of tempEventIds) {
          if (tempEventId == event._id) {
            found = true;
          }
        }
        if(!found) {
          tempEvents.push(event);
        }
      }
    }));
    this.hostedEvents = {
      availableEvents: tempEvents,
      applications: applicationBookings,
      applicationNotifications: numNotif,
      requests: requestBookings,
      requestNotifications: reqNotif,
      confirmations: confirmedBookings,
      confirmationNotifications: numConf, 
      paymentStatues: []};
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let eventIndex: number = -1;
    let applicationIndex: number = -1;
    let requestIndex: number = -1;
    let confirmationIndex: number = -1;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      eventIndex = this.hostedEvents.availableEvents.findIndex(e => e._id == newBooking.eventEID._id);
      requestIndex = this.hostedEvents.requests.findIndex(r => r._id == newBooking._id)
      applicationIndex = this.hostedEvents.applications.findIndex(a => a._id == newBooking._id);
      // Remove from applications/requests and put on confirmations
      if(newBooking.bookingType == 'artist-apply') {
        this.hostedEvents.applications.splice(applicationIndex, 1);
      } else {
        this.hostedEvents.requests.splice(requestIndex, 1);
      }
      this.hostedEvents.confirmations.push(newBooking);
      this.hostedEvents.confirmationNotifications++;

    } else if(response == NegotiationResponses.new) {
      // Otherwise, check if there is a new bid or offer
      eventIndex = this.hostedEvents.availableEvents.findIndex(e => e._id == newBooking.eventEID._id);
      requestIndex = this.hostedEvents.requests.findIndex(r => r._id == newBooking._id);
      applicationIndex = this.hostedEvents.applications.findIndex(a => a._id == newBooking._id);
      if(applicationIndex >= 0) {
        // Then it must be an event with a current application
        // Update this event
        if(this.hostedEvents.applications[applicationIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.hostedEvents.applicationNotifications++;
        }
        this.hostedEvents.applications[applicationIndex] = newBooking;
      } else if(requestIndex >= 0){
        // Then it is an event with a current request
        // Update this event
        if(this.hostedEvents.requests[requestIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.hostedEvents.requestNotifications++;
        }
        this.hostedEvents.requests[requestIndex] = newBooking;
      } else {
        // Otherwise, it is a brand new application/request
        // Push onto applications/requests
        if(newBooking.bookingType == 'artist-apply') {
          this.hostedEvents.applications.push(newBooking);
          // Increment the notifications
          this.hostedEvents.applicationNotifications++;
        } else {
          this.hostedEvents.requests.push(newBooking);
          // Increment the notifications
          this.hostedEvents.requestNotifications++;
        }
        // Remove from available events
        this.hostedEvents.availableEvents.splice(eventIndex, 1);
      }
    } else if(response == NegotiationResponses.decline) {
      // Find it in applications and remove it
      eventIndex = this.hostedEvents.availableEvents.findIndex(e => e._id == newBooking.eventEID._id);
      if(newBooking.bookingType == 'artist-apply') {
        applicationIndex = this.hostedEvents.applications.findIndex(a => a._id == newBooking._id);
        this.hostedEvents.applications.splice(applicationIndex, 1);
      } else {
        requestIndex = this.hostedEvents.requests.findIndex(r => r._id == newBooking._id);
        this.hostedEvents.requests.splice(requestIndex, 1);
      }
    } else if(response == NegotiationResponses.cancel) {
      // Find it in confirmations and remove it
      eventIndex = this.hostedEvents.availableEvents.findIndex(e => e._id == newBooking.eventEID._id);
      confirmationIndex = this.hostedEvents.confirmations.findIndex(a => a._id == newBooking._id);
      this.hostedEvents.confirmations.splice(confirmationIndex, 1);
    }
  }

  resetConfirmations(event: MatTabChangeEvent) {
    if(event.index == 3) {
      this.hostedEvents.confirmationNotifications = 0;
      for(let booking of this.hostedEvents.confirmations) {
        if(!booking.artViewed) {
          booking.artViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    }
  }

  newRequest(event: Event, eventIndex: number) {
    let view = this.eventService.event.hostUser._id == this.userService.user._id ? "host" : "artist";
    let tempBooking = new Booking(undefined, 'host-request', event.hostUser, this.artist, event, false, false, false, StatusMessages.waitingOnArtist, StatusMessages.hostOffer, false, false, true, event.fixedPrice);
    this.bookingService.negotiate(tempBooking, true, view).subscribe((result) => {
      if (result != undefined) {
        if (result.response == NegotiationResponses.new) {
          tempBooking.currentPrice = result.price;
          this.bookingService.createBooking(tempBooking).then((booking: Booking) => {
            // Remove from available events
            this.hostedEvents.availableEvents.splice(eventIndex, 1);
            // Push onto requested bookings
            this.hostedEvents.requests.push(booking);
            // Send notification to artist
            this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id], 
          'queue_music', booking.hostUser.firstName + " has requested you for an event called: " + booking.eventEID.eventName);
          });
        }
      }
    });
  }

  openNegotiationDialog(booking: Booking, bookingIndex: number) {
    let view = this.eventService.event.hostUser._id == this.userService.user._id ? "host" : "artist";
    this.bookingService.negotiate(booking, false, view)
    .subscribe((result) => {
      // Check to see if a response was recorded in the negotiation dialog box
      if (result != undefined) {
        // Check to see what the response was
        if (result.response == NegotiationResponses.new) {
          // New, the user offered a new monetary amount to the artist
          // Set the new price
          booking.currentPrice = result.price;
          // Swap the approvals so that the artist now needs to approve the new price
          booking.hostApproved = true;
          booking.hostStatusMessage = StatusMessages.waitingOnArtist;
          booking.artistApproved = false;
          booking.artistStatusMessage = StatusMessages.hostOffer;
          // Update the booking asynchronously
          this.bookingService.updateBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == 'artist-apply') {
              this.hostedEvents.applications[bookingIndex] = booking;
              this.hostedEvents.applicationNotifications--;
            } else {
              this.hostedEvents.requests[bookingIndex] = booking;
              this.hostedEvents.requestNotifications--;
            }
            this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id],
            'import_export', booking.hostUser.firstName + " has updated the offer on " + booking.eventEID.eventName);
          });
        } else if (result.response == NegotiationResponses.accept) {
          // Accept, the user accepted a bid from an artist or they reconfirmed their previous offer to the artist
          // No price change
          // Check to see if it was already artist approved, otherwise no change
          booking.hostApproved = true;
          if(booking.artistApproved) {
            // Confirm booking
            booking.approved = true;
            booking.hostStatusMessage = StatusMessages.bookingConfirmed;
            booking.artistStatusMessage = StatusMessages.bookingConfirmed;
            // Asynchronously update
            this.bookingService.acceptBooking(booking).then(() => {
              // Update the model of the component
              if(booking.bookingType == 'artist-apply') {
                this.hostedEvents.applications.splice(bookingIndex, 1);
                this.hostedEvents.applicationNotifications--;
              } else {
                this.hostedEvents.requests.splice(bookingIndex, 1);
                this.hostedEvents.requestNotifications--;
              }
              this.hostedEvents.confirmations.push(booking);
              this.hostedEvents.confirmationNotifications++;
              this.createNotificationForArtist(booking, result.response, ['/profile', 'performances'],
              'event_available', booking.hostUser.firstName + " has confirmed the booking" + booking.eventEID.eventName);
            })
          }
        } else if (result.response == NegotiationResponses.decline) {
          // Decline, the user declined a bid from an artist
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == 'artist-apply') {
              this.hostedEvents.applications.splice(bookingIndex, 1);
              this.hostedEvents.applicationNotifications--;
            } else {
              this.hostedEvents.requests.splice(bookingIndex, 1);
              this.hostedEvents.requestNotifications--;
            }
            this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id],
            'event_busy', booking.hostUser.firstName + " has cancelled the request on " + booking.eventEID.eventName);
          })
        } else if(result.response == NegotiationResponses.cancel) {
          // Cancellation, the user cancelled a confirmed booking
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            this.hostedEvents.confirmations.splice(bookingIndex, 1);
            this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id],
            'event_busy', booking.hostUser.firstName + " has cancelled the confirmed boking for " + booking.eventEID.eventName);
          })
        } else {
          // No change, the user kept their confirmed booking
        }
      }
    });
  }

  createNotificationForArtist(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(booking.hostUser, booking.performerUser, booking.eventEID._id,
      booking, response, message, icon, route);
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

}
