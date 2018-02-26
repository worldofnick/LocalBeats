// Angular Modules
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";
import { MatTabChangeEvent } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { PaymentHistoryDialog } from '../profile-performances/profile-performances/profile-performances.component';


// Services
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { SocketService } from 'app/services/chats/socket.service';
import { StripeService } from 'app/services/payments/stripe.service';

// Data Models
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking, StatusMessages, NegotiationResponses } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action';
import { SocketEvent } from '../../../services/chats/model/event';
import { Notification } from '../../../models/notification';
import { Message } from '../../../services/chats/model/message';
import { Payment, PaymentStatus } from '../../../models/payment';


@Component({
  selector: 'app-profile-events',
  templateUrl: './profile-events.component.html',
  styleUrls: ['./profile-events.component.css']
})
export class ProfileEventsComponent implements OnInit {
  // User Model
  user: User;
  private submitted: boolean = false;
  // Hosted Events of the User Model
  events: {
    event: Event,
    applications: Booking[],
    applicationNotifications: number,
    requests: Booking[],
    requestNotifications: number,
    confirmations: Booking[],
    confirmationNotifications: number,
    paymentStatues: PaymentStatus[]}[];

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    private stripeService: StripeService,
    public dialog: MatDialog
  ) {
    // Set user model to the authenticated singleton user
    this.user = this.userService.user;
    // Get the events of the user
    this.getEvents();
  }

  ngOnInit() {
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        if (notification.response == NegotiationResponses.payment) {
          this.updatePaymentStatues(notification.booking);
        } else {
          this.updateModel(notification.booking, notification.response);
        }
    });
  }

  private updatePaymentStatues(booking: Booking) {
    // Update payment status'
    let eventIndex = this.events.findIndex(e => e.event._id == booking.eventEID._id);
    let confirmationIndex = this.events[eventIndex].confirmations.findIndex(b => b._id == booking._id);
    this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
      this.events[eventIndex].paymentStatues[confirmationIndex] = status;
    });
  }

  private getEvents() {
    // Get all events associated with the user
    this.events = [];
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      for(let e of events) {
        // Get the bookings associated with each event
        // Get the confirmed bookings
        let confirmedBookings: Booking[] = [];
        // Get the application bookings
        let applicationBookings: Booking[] = [];
        // Get the request bookings
        let requestBookings: Booking[] = [];
        // Get the notification count for the applications
        let numNotif: number = 0;
        let reqNotif: number = 0;
        let numConf: number = 0;
        let paymentStatues = [];  
        this.bookingService.getBooking(e).then((bookings: Booking[]) => {
          for(let booking of bookings) {
            if(booking.approved) {
              confirmedBookings.push(booking);
              // If the booking is confirmed and has not yet been viewed by the host, a new notification exists
              if(!booking.hostViewed) {
                numConf++;
              }
              this.bookingService.bookingPaymentStatus(booking).then((status: string) => {
                paymentStatues.push(status);
              });
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
          this.events.push({event: e, applications: applicationBookings, applicationNotifications: numNotif,
            requests: requestBookings, requestNotifications: reqNotif, confirmations: confirmedBookings, confirmationNotifications: numConf,
            paymentStatues: paymentStatues});
        })
      }
    })
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let eventIndex: number = -1;
    let applicationIndex: number = -1;
    let requestIndex: number = -1;
    let confirmationIndex: number = -1;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      requestIndex = this.events[eventIndex].requests.findIndex(r => r._id == newBooking._id)
      applicationIndex = this.events[eventIndex].applications.findIndex(a => a._id == newBooking._id);
      // Remove from applications/requests and put on confirmations
      if(newBooking.bookingType == 'artist-apply') {
        this.events[eventIndex].applications.splice(applicationIndex, 1);
      } else {
        this.events[eventIndex].requests.splice(requestIndex, 1);
      }
      this.events[eventIndex].confirmations.push(newBooking);
      this.events[eventIndex].confirmationNotifications++;

    } else if(response == NegotiationResponses.new) {
      // Otherwise, check if there is a new bid or offer
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      requestIndex = this.events[eventIndex].requests.findIndex(r => r._id == newBooking._id);
      applicationIndex = this.events[eventIndex].applications.findIndex(a => a._id == newBooking._id);
      if(applicationIndex >= 0) {
        // Then it must be an event with a current application
        // Update this event
        if(this.events[eventIndex].applications[applicationIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.events[eventIndex].applicationNotifications++;
        }
        this.events[eventIndex].applications[applicationIndex] = newBooking;
      } else if(requestIndex >= 0){
        // Then it is an event with a current request
        // Update this event
        if(this.events[eventIndex].requests[requestIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.events[eventIndex].requestNotifications++;
        }
        this.events[eventIndex].requests[requestIndex] = newBooking;
      } else {
        // Otherwise, it is a brand new application/request
        // Push onto applications/requests
        if(newBooking.bookingType == 'artist-apply') {
          this.events[eventIndex].applications.push(newBooking);
          // Increment the notifications
          this.events[eventIndex].applicationNotifications++;
        } else {
          this.events[eventIndex].requests.push(newBooking);
          // Increment the notifications
          this.events[eventIndex].requestNotifications++;
        }
        
      }
    } else if(response == NegotiationResponses.decline) {
      // Find it in applications and remove it
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      if(newBooking.bookingType == 'artist-apply') {
        applicationIndex = this.events[eventIndex].applications.findIndex(a => a._id == newBooking._id);
        this.events[eventIndex].applications.splice(applicationIndex, 1);
      } else {
        requestIndex = this.events[eventIndex].requests.findIndex(r => r._id == newBooking._id);
        this.events[eventIndex].requests.splice(requestIndex, 1);
      }
    } else if(response == NegotiationResponses.cancel) {
      // Find it in confirmations and remove it
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      confirmationIndex = this.events[eventIndex].confirmations.findIndex(a => a._id == newBooking._id);
      this.events[eventIndex].confirmations.splice(confirmationIndex, 1);
    }
  }

  resetConfirmations(event: MatTabChangeEvent, eventIndex: number) {
    if(event.index == 3) {
      this.events[eventIndex].confirmationNotifications = 0;
      for(let booking of this.events[eventIndex].confirmations) {
        if(!booking.hostViewed) {
          booking.hostViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    }
  }

  onDeleteEvent(event: Event, index: number) {
    this.eventService.deleteEventByEID(event).then((status: Number) => {
      if (status == 200) {
        this.events.splice(index, 1);
      }
    });
  }

  onEditEvent(event: Event) {
    this.router.navigate(['/events', 'update', event._id]);    
  }

  onViewEvent(event: Event) {
    this.router.navigate(['/events', event._id]);
  }

  openNegotiationDialog(booking: Booking, bookingIndex: number, eventIndex: number) {
    this.bookingService.negotiate(booking, false)
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
              this.events[eventIndex].applications[bookingIndex] = booking;
              this.events[eventIndex].applicationNotifications--;
            } else {
              this.events[eventIndex].requests[bookingIndex] = booking;
              this.events[eventIndex].requestNotifications--;
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
                this.events[eventIndex].applications.splice(bookingIndex, 1);
                this.events[eventIndex].applicationNotifications--;
              } else {
                this.events[eventIndex].requests.splice(bookingIndex, 1);
                this.events[eventIndex].requestNotifications--;
              }
              this.events[eventIndex].confirmations.push(booking);
              this.events[eventIndex].confirmationNotifications++;
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
              this.events[eventIndex].applications.splice(bookingIndex, 1);
              this.events[eventIndex].applicationNotifications--;
            } else {
              this.events[eventIndex].requests.splice(bookingIndex, 1);
              this.events[eventIndex].requestNotifications--;
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
            this.events[eventIndex].confirmations.splice(bookingIndex, 1);
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

  messageArtist(booking:Booking){
    let message:Message = {
      to: booking.performerUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  showPayDialog(booking: Booking) {
    this.submitted = true;
    let dialogRef: MatDialogRef<ConfirmPaymentDialog>;
    dialogRef = this.dialog.open(ConfirmPaymentDialog, {
        width: '250px',
        disableClose: false,
        data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updatePaymentStatues(booking);
      this.submitted = false;
    });
  }

  showPaymentHistoryDialog(booking: Booking) {
    let userID = this.userService.user._id;
    let dialogRef: MatDialogRef<PaymentHistoryDialog>;
    this.stripeService.getBookingPayments(booking).then((payments: Payment[]) => {
      dialogRef = this.dialog.open(PaymentHistoryDialog, {
          width: '420px',
          disableClose: false,
          data: { payments, userID }
      });

    });

  }

}

@Component({
  selector: 'payment-confirm-dialog',
  templateUrl: 'payment-confirm-dialog.html',
})
export class ConfirmPaymentDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfirmPaymentDialog>, private stripeService: StripeService, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.stripeService.charge
    this.stripeService.charge(this.data.booking).then((success: boolean) => {
      this.dialogRef.close();
      if (success) {
        let snackBarRef = this.snackBar.open('Payment sent!', "", {
          duration: 1500,
        });
      } else {
        let snackBarRef = this.snackBar.open('Payment failed, please try again.', "", {
          duration: 1500,
        });
      }
    });
  }

}
