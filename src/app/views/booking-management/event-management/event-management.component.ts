// Angular Modules
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";
import { MatTabChangeEvent } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';

// Services
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { SocketService } from 'app/services/chats/socket.service';
import { StripeService } from 'app/services/payments/stripe.service';
import { ReviewService } from 'app/services/reviews/review.service';

// Data Models
import { User } from '../../../models/user';
import { Review } from '../../../models/review';
import { Event, CancellationPolicy } from '../../../models/event';
import { Booking, StatusMessages, NegotiationResponses, VerificationResponse, BookingType } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action';
import { SocketEvent } from '../../../services/chats/model/event';
import { Notification } from '../../../models/notification';
import { Message } from '../../../services/chats/model/message';
import { MessageTypes } from'../../../services/chats/model/messageTypes';
import { Payment, PaymentStatus } from '../../../models/payment';

// Components
import { ConfirmPaymentDialogComponent } from '../confirm-payment-dialog/confirm-payment-dialog.component';
import { PaymentHistoryDialogComponent } from '../payment-history-dialog/payment-history-dialog.component';

// External Libraries
import {
  startOfDay,
  endOfDay,
  subDays,
  addMinutes,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  isWithinRange
} from 'date-fns';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.css']
})
export class EventManagementComponent implements OnInit {
  // User Model
  user: User;
  socketSubscription: ISubscription;
  negotiationSubscription: ISubscription;
  verificationSubscription: ISubscription;
  reviewSubscription: ISubscription;
  paySubscription: ISubscription;
  private canPay: boolean = true;
  // Hosted Events of the User Model
  events: {
    event: Event,
    applications: Booking[],
    applicationNotifications: number,
    requests: Booking[],
    requestNotifications: number,
    confirmations: Booking[],
    confirmationNotifications: number,
    completions: Booking[],
    completionNotifications: number,
    cancellations: Booking[],
    cancellationNotifications: number,
    paymentStatues: PaymentStatus[],
    cancelledPaymentStatues: PaymentStatus[]}[];

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    private stripeService: StripeService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    // Set user model to the authenticated singleton user
    this.user = this.userService.user;
    // Get the events of the user
    this.getEvents();
  }

  ngOnInit() {
    this.socketSubscription = this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
          this.updateModel(notification.booking, notification.response);
    });
    this.negotiationSubscription = null;
    this.verificationSubscription = null;
    this.reviewSubscription = null;
    this.paySubscription = null;
  }

  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    if(this.negotiationSubscription) {
      this.negotiationSubscription.unsubscribe();
    }
    if(this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }
    if(this.reviewSubscription) {
      this.reviewSubscription.unsubscribe();
    }
    if(this.paySubscription) {
      this.paySubscription.unsubscribe();
    }
  }

  /*
  Updates all payment statuses for the provided booking
  */
  private updatePaymentStatues(booking: Booking) {
    // Update payment status'
    let eventIndex = this.events.findIndex(e => e.event._id == booking.eventEID._id);
    let completionIndex = -1
    completionIndex = this.events[eventIndex].completions.findIndex(b => b._id == booking._id);
    if(completionIndex > -1) {
      this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
        this.events[eventIndex].paymentStatues[completionIndex] = status;
        if(booking.completed && status == PaymentStatus.paid && booking.bothReviewed) {
          booking.hostStatusMessage = StatusMessages.completed;
          booking.artistStatusMessage = StatusMessages.completed;
        } else if(booking.completed && status == PaymentStatus.paid) {
          if(booking.beenReviewedByArtist) {
            booking.artistStatusMessage = StatusMessages.reviewed;
            booking.hostStatusMessage = StatusMessages.needsReview;
          } else if(booking.beenReviewedByHost){
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.hostStatusMessage = StatusMessages.reviewed;
          } else {
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.hostStatusMessage = StatusMessages.needsReview;
          }
        } else if(status == PaymentStatus.refund) {
          booking.hostStatusMessage = StatusMessages.refund;
          booking.hostStatusMessage = StatusMessages.refund;
        }
        this.bookingService.updateBooking(booking);
      });
    } else {
      let cancellationIndex = this.events[eventIndex].cancellations.findIndex(b => b._id == booking._id);
      this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
        this.events[eventIndex].cancelledPaymentStatues[cancellationIndex] = status;
        booking.artistStatusMessage = StatusMessages.cancelled;
        booking.hostStatusMessage = StatusMessages.cancelled;
        this.bookingService.updateBooking(booking);
      })
    }
  }

  reviewDialog(booking: Booking) {
    let review: Review = new Review;
    review.booking = booking;
    review.toUser = booking.performerUser;
    review.fromUser = booking.hostUser;
    if(this.reviewSubscription) {
      this.reviewSubscription.unsubscribe();
      this.reviewSubscription = null;
    }
    this.reviewSubscription = this.reviewService.review(review, false).subscribe((result) => {
      if (result.rating == -1) {
        // user clicked cancel in the review dialog.
        return;
      }
      this.reviewService.createReview(result).then( (newReview: Review) => {
          booking.beenReviewedByHost = true;
          booking.hostStatusMessage = StatusMessages.reviewed;
          booking.artistStatusMessage = StatusMessages.needsReview;
          booking.artViewed = false;
          booking.hostViewed = true;
          if(booking.beenReviewedByArtist){
            booking.bothReviewed = true;
            booking.artistStatusMessage = StatusMessages.completed;
            booking.hostStatusMessage = StatusMessages.completed;
          }
          this.bookingService.updateBooking(booking).then( () => {
            // new review is null right here.
            if (booking.bothReviewed) {
              this.bookingService.sendNotificationsToBoth(review);
            }else{
              this.bookingService.sendNotificationsToArtist(review);
            }
          });
      });
    });
  }

  editReview(booking: Booking) {
    let reviewToEdit: Review = new Review;
    this.reviewService.getReviewsFrom(booking.hostUser).then( (reviews) => {
      for (let review of reviews){
        if (review.booking._id == booking._id){
          reviewToEdit = review;
        }
      }
      this.reviewService.review(reviewToEdit, true).subscribe((result) => {
        if (result.rating == null) {
          return;
        }
        if (result.rating == -1) {
          // if the user pressed cancel when editing
          return;
        }else if (result.rating == -2) {
          // if the user pressed delete when editing
          this.reviewService.deleteReviewByRID(result).then( () => {
            // this.setReviews();
            booking.beenReviewedByHost = false;
            this.bookingService.updateBooking(booking);
          });
        }else {
          this.reviewService.updateReview(reviewToEdit);
        }
      });
    }); 
  }

  /* 
  Retrieves all of the events hosted by the user of the model
  Booking Cases:
  1. Applications
  2. Requests
  3. Confirmations
  4. Completions
  5. Cancellations
  Notifications occur if hostViewed boolean is false in the booking model
  */
  private getEvents() {
    // Get all events associated with the user
    this.events = [];
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      for(let e of events) {
        // Get the bookings associated with each event
        // Get the confirmed bookings, which could be cancelled, verified, or not
        let confirmedBookings: Booking[] = [];
        // Get the completed bookings, which have been verified and paid
        let completedBookings: Booking[] = [];
        // Get the application bookings
        let applicationBookings: Booking[] = [];
        // Get the request bookings
        let requestBookings: Booking[] = [];
        // Get the cancelled bookings
        let cancelledBookings: Booking[] = [];
        // Get the notification counts
        let numNotif: number = 0;
        let reqNotif: number = 0;
        let numConf: number = 0;
        let completeNotif: number = 0;
        let cancelNotif: number = 0;
        let paymentStatues: PaymentStatus[] = [];  
        let cancelledPaymentStatues: PaymentStatus[] = [];
        this.bookingService.getBooking(e).then((bookings: Booking[]) => {
          for(let booking of bookings) {
            if(booking.approved) {
              if(booking.completed) {
                completedBookings.push(booking);
                // If the booking is completed and has not yet been viewed by the host, a new notification exists
                if(!booking.hostViewed) {
                  completeNotif++;
                }
                // If a booking is complete, it should have a payment status
                this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                  paymentStatues.push(status);
                });
              } else if(!booking.cancelled) {
                confirmedBookings.push(booking);
                // If the booking is confirmed and has not yet been viewed by the artist, a new notification exists
                if(!booking.hostViewed) {
                  numConf++;
                }
              } else {
                cancelledBookings.push(booking);
                if(!booking.artViewed) {
                  cancelNotif++;
                }
                // If a booking is cancelled, get its payment status
                this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                  cancelledPaymentStatues.push(status);
                })
              }
            } else {
              // Check to see if the artist applied
              if(booking.bookingType == BookingType.artistApply) {
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
          this.events.push({
            event: e,
            applications: applicationBookings,
            applicationNotifications: numNotif,
            requests: requestBookings,
            requestNotifications: reqNotif,
            confirmations: confirmedBookings,
            confirmationNotifications: numConf,
            completions: completedBookings,
            completionNotifications: completeNotif,
            cancellations: cancelledBookings,
            cancellationNotifications: cancelNotif,
            paymentStatues: paymentStatues,
            cancelledPaymentStatues: cancelledPaymentStatues
          });
        })
      }
    })
  }

  /*
  Receives a response and a new booking from the subscription to the socket
  Updates the component model in real-time according to the negotiation response
  Negotiation Cases:
  1. New Bid/Application - find if already on applications/requests, otherwise push onto applications/requests
  2. Accepted by Artist, Booking Approved - splice booking from applications/requests and push onto confirmations
  3. Declined - find in applications/requests and splice it
  4. Cancelled - find in applications/requests/confirmations, splice it
  5. Complete - artist has done final verification, find in confirmations, splice it, and push onto completions, update payment statuses
  6. Verification - artist has verified, but host has yet to verify, update confirmations with a notification
  7. Payment - a refund has occurred from the artist, update the completed booking and payment statuses
  */
  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let eventIndex: number = -1;
    let applicationIndex: number = -1;
    let requestIndex: number = -1;
    let confirmationIndex: number = -1;
    let completionIndex: number = -1;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      requestIndex = this.events[eventIndex].requests.findIndex(r => r._id == newBooking._id)
      applicationIndex = this.events[eventIndex].applications.findIndex(a => a._id == newBooking._id);
      // Remove from applications/requests and put on confirmations
      if(newBooking.bookingType == BookingType.artistApply) {
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
        if(newBooking.bookingType == BookingType.artistApply) {
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
      // Find it in applications/requests and remove it
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      if(newBooking.bookingType == BookingType.artistApply) {
        applicationIndex = this.events[eventIndex].applications.findIndex(a => a._id == newBooking._id);
        this.events[eventIndex].applications.splice(applicationIndex, 1);
      } else {
        requestIndex = this.events[eventIndex].requests.findIndex(r => r._id == newBooking._id);
        this.events[eventIndex].requests.splice(requestIndex, 1);
      }
    } else if(response == NegotiationResponses.cancel) {
      // Find it in confirmations
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      confirmationIndex = this.events[eventIndex].confirmations.findIndex(a => a._id == newBooking._id);
      // The artist has cancelled
      this.events[eventIndex].cancellations.push(newBooking);
      this.events[eventIndex].cancellationNotifications++;
      this.events[eventIndex].confirmations.splice(confirmationIndex,1);
      // If a booking is cancelled, check its payment status
      this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
        this.events[eventIndex].cancelledPaymentStatues.push(status);
      })
    } else if(response == NegotiationResponses.complete) {
      // Find it in confirmations
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      confirmationIndex = this.events[eventIndex].confirmations.findIndex(a => a._id == newBooking._id);
      // The artist has verified and the booking is complete
      this.events[eventIndex].confirmations.splice(confirmationIndex,1);
      this.events[eventIndex].completionNotifications++;
      this.events[eventIndex].completions.push(newBooking);
      // Get the payment statuses
      // If a booking is complete, it should have a payment status
      this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
        this.events[eventIndex].paymentStatues.push(status);
      });
    } else if(response == NegotiationResponses.verification) {
      // Find it in confirmations
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      confirmationIndex = this.events[eventIndex].confirmations.findIndex(a => a._id == newBooking._id);
      // The artist has verified or not and now waiting on host verification
      this.events[eventIndex].confirmationNotifications++;
      this.events[eventIndex].confirmations[confirmationIndex] = newBooking;
    } else if(response == NegotiationResponses.payment) {
      // Update payment status of completed booking because a refund has happened
      if(!newBooking.cancelled) {
        eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
        completionIndex = this.events[eventIndex].completions.findIndex(a => a._id == newBooking._id);
        this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
          this.events[eventIndex].completions[completionIndex] = newBooking;
          this.events[eventIndex].completionNotifications++;
          if(newBooking.completed && status == PaymentStatus.paid && newBooking.bothReviewed) {
            newBooking.hostStatusMessage = StatusMessages.completed;
            newBooking.artistStatusMessage = StatusMessages.completed;
          } else if(newBooking.completed && status == PaymentStatus.paid) {
            if(newBooking.beenReviewedByArtist) {
              newBooking.hostStatusMessage = StatusMessages.needsReview;
              newBooking.artistStatusMessage = StatusMessages.reviewed;
            } else {
              newBooking.hostStatusMessage = StatusMessages.reviewed;
              newBooking.artistStatusMessage = StatusMessages.needsReview;
            }
          }else if(status == PaymentStatus.refund) {
            newBooking.hostStatusMessage = StatusMessages.refund;
            newBooking.hostStatusMessage = StatusMessages.refund;
          }
          this.bookingService.updateBooking(newBooking);
          this.events[eventIndex].paymentStatues[completionIndex] = status;
        });
      }
    } else if (response == NegotiationResponses.review) {
      eventIndex = this.events.findIndex(e => e.event._id == newBooking.eventEID._id);
      completionIndex = this.events[eventIndex].completions.findIndex(a => a._id == newBooking._id);
      this.events[eventIndex].completions[completionIndex] = newBooking;
      if(!newBooking.hostViewed) {
        this.events[eventIndex].completionNotifications++;
      }
    }
  }

  /*
  Resets all completion notifications to 0 when that expansion panel has been clicked
  */
  resetCompletionNotifications(eventIndex: number) {
    this.events[eventIndex].completionNotifications = 0;
    for(let booking of this.events[eventIndex].completions) {
      if(!booking.hostViewed) {
        booking.hostViewed = true;
        this.bookingService.updateBooking(booking);
      }
    }
  }

  /*
  Resets all cancellation notifications to 0 when that expansion panel has been clicked
  */
  resetCancellationNotifications(eventIndex: number) {
    this.events[eventIndex].cancellationNotifications = 0;
    for(let booking of this.events[eventIndex].cancellations) {
      if(!booking.hostViewed) {
        booking.hostViewed = true;
        this.bookingService.updateBooking(booking);
      }
    }
  }

  /*
  Resets all confirmation notifications to 0 when that expansion panel has been clicked
  */
  resetConfirmationNotifications(eventIndex: number) {
    this.events[eventIndex].confirmationNotifications = 0;
    for(let booking of this.events[eventIndex].confirmations) {
      if(!booking.hostViewed) {
        booking.hostViewed = true;
        this.bookingService.updateBooking(booking);
      }
    }
  }

  /*
  Removes the event and all of its bookings from the model if the event is successfully
  deleted in the database
  */
  onDeleteEvent(event: Event, index: number) {
    this.eventService.deleteEventByEID(event).then((status: Number) => {
      if (status == 200) {
        this.events.splice(index, 1);
      }
    });
  }

  /*
  Takes user to edit their event
  */
  onEditEvent(event: Event) {
    this.router.navigate(['/events', 'update', event._id]);    
  }

  /*
  Takes user to their event singleton view page
  */
  onViewEvent(event: Event) {
    this.router.navigate(['/events', event._id]);
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

  /*
  Host verifies that the artist has or has not arrived at the confirmed booking
  Cases:
  1. Verified and the Artist has not verified - send a verification notification to artist
  2. Verified and the Artist has verified - complete the booking and send payment to artist
  */
  hostVerify(booking: Booking, bookingIndex: number, eventIndex: number) {
    if(this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }
    this.verificationSubscription = this.bookingService.verify(booking, true)
    .subscribe((result)=> {
      // Check to see if a response was recorded in the verification dialog box
      if(result != undefined) {
        // Check to see what the response was
        if(result.comment != null && result.comment != undefined) {
          let privateMessage: Message = this.commentToArtist(result.comment, booking);
          this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
        }
        let notificationMessage: string = '';
        let response:NegotiationResponses = null;
        if(result.response == VerificationResponse.verify) {
          // The host has verified the artist's attendance
          booking.hostVerified = true;
          // If Artist has verified, the booking is complete
          if(booking.artistVerified) {
            booking.hostStatusMessage = StatusMessages.needsReview;
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.completed = true;
            booking.hostViewed = false;
            booking.artViewed = false;
            notificationMessage = booking.hostUser.firstName + " has paid you for " + booking.eventEID.eventName + ". Please go and submit a review to complete the booking.";
            response = NegotiationResponses.complete;
          } else {
            booking.hostStatusMessage = StatusMessages.waitingOnArtist;
            booking.artistStatusMessage = StatusMessages.hostVerified;
            booking.artViewed = false;
            booking.hostViewed = true;
            notificationMessage = booking.hostUser.firstName + " has verified you for the event " + booking.eventEID.eventName;
            response = NegotiationResponses.verification;
          }
        } else {
          // The host has rejected verification of the artist's attendance
          booking.hostStatusMessage = StatusMessages.hostRejected;
          booking.artistStatusMessage = StatusMessages.hostRejected;
          booking.artViewed = false;
          booking.hostViewed = true;
          booking.hostVerified = false;
          notificationMessage = booking.hostUser.firstName + " has invalidated you for the event " + booking.eventEID.eventName;
          response = NegotiationResponses.verification;
        }
        // Update the booking and payment asynchronously
        if(booking.completed) {
          this.stripeService.charge(booking, true).then((success: boolean) => {
            if (success) {
              this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                // If payment was successful, push a new status
                this.events[eventIndex].paymentStatues.push(status);
                // Move the booking from confirmations to completions
                this.events[eventIndex].confirmations.splice(bookingIndex, 1);
                this.events[eventIndex].completions.push(booking);
                let snackBarRef = this.snackBar.open('Payment sent!', "", {
                  duration: 1500,
                });
                // Update the model and send a notification if the model updates correctly
                this.bookingService.updateBooking(booking).then(() => {
                  // Send notification to artist
                  this.createNotificationForArtist(booking, response, ['/bookingmanagement', 'myperformances'],
                  'event_available', notificationMessage);
                });
              });
            } else {
              // Payment failed, so change the booking to not be completed
              booking.completed = false;
              booking.hostStatusMessage = StatusMessages.unpaid;
              booking.artistStatusMessage = StatusMessages.unpaid;
              this.events[eventIndex].confirmations[bookingIndex] = booking;
              // Don't push a payment status, because the payment failed
              notificationMessage = "Your booking is incomplete, payment by " + booking.hostUser.firstName + " for the event " + booking.eventEID.eventName + " failed";
              let snackBarRef = this.snackBar.open('Payment failed, please try again.', "", {
                duration: 1500,
              });
              // Update the model and send a notification if the model updates correctly
              this.bookingService.updateBooking(booking).then(() => {
                // Send notification to artist
                this.createNotificationForArtist(booking, response, ['/bookingmanagement', 'myperformances'],
                'event_available', notificationMessage);
              });
            }
          });
        } else {
          // Otherwise, the booking is not complete, so just a normal verification happened
          this.events[eventIndex].confirmations[bookingIndex] = booking;
          // Update the model and send a notification if the model updates correctly
          this.bookingService.updateBooking(booking).then(() => {
            // Send notification to artist
            this.createNotificationForArtist(booking, response, ['/bookingmanagement', 'myperformances'],
            'event_available', notificationMessage);
          });
        }
      }
    })
  }

  /*
  Host responds to applications/bids through negotiation dialog
  */
  openNegotiationDialog(booking: Booking, bookingIndex: number, eventIndex: number) {
    let view = "host";
    if(this.negotiationSubscription) {
      this.negotiationSubscription.unsubscribe();
    }
    this.negotiationSubscription = this.bookingService.negotiate(booking, false, view, "")
    .subscribe((result) => {
      // Check to see if a response was recorded in the negotiation dialog box
      if (result != undefined) {
        // Check to see what the response was
        if(result.comment != null && result.comment != undefined) {
          let privateMessage: Message = this.commentToArtist(result.comment, booking);
          this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
        }
        if (result.response == NegotiationResponses.new) {
          // New, the user offered a new monetary amount to the artist
          // Set the new price
          booking.currentPrice = result.price;
          // Swap the approvals so that the artist now needs to approve the new price
          booking.hostApproved = true;
          booking.hostStatusMessage = StatusMessages.waitingOnArtist;
          booking.artistApproved = false;
          booking.artistStatusMessage = StatusMessages.hostOffer;
          booking.hostViewed = true;
          booking.artViewed = false;
          // Update the booking asynchronously
          this.bookingService.updateBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == BookingType.artistApply) {
              this.events[eventIndex].applications[bookingIndex] = booking;
              this.events[eventIndex].applicationNotifications--;
            } else {
              this.events[eventIndex].requests[bookingIndex] = booking;
              this.events[eventIndex].requestNotifications--;
            }
            this.createNotificationForArtist(booking, result.response, ['/bookingmanagement', 'myperformances'],
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
            booking.hostViewed = false;
            booking.artViewed = false;
            // Asynchronously update
            this.bookingService.acceptBooking(booking, view).then(() => {
              // Update the model of the component
              if(booking.bookingType == BookingType.artistApply) {
                this.events[eventIndex].applications.splice(bookingIndex, 1);
                this.events[eventIndex].applicationNotifications--;
              } else {
                this.events[eventIndex].requests.splice(bookingIndex, 1);
                this.events[eventIndex].requestNotifications--;
              }
              this.events[eventIndex].confirmations.push(booking);
              this.events[eventIndex].confirmationNotifications++;
              this.createNotificationForArtist(booking, result.response, ['/bookingmanagement', 'myperformances'],
              'event_available', booking.hostUser.firstName + " has confirmed the booking" + booking.eventEID.eventName);
              this.createNotificationForOtherPersistenHosts(booking, result.response, ['/bookingmanagement', 'myperformances'],
              'event_available', booking.hostUser.firstName + " has confirmed the booking" + booking.eventEID.eventName);
            })
          }
        } else if (result.response == NegotiationResponses.decline) {
          // Decline, the user declined a bid from an artist
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          booking.hostViewed = true;
          booking.artViewed = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == BookingType.artistApply) {
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
          booking.cancelled = true;
          booking.artViewed = false;
          booking.hostViewed = true;
          booking.hostStatusMessage = StatusMessages.cancelled;
          booking.artistStatusMessage = StatusMessages.cancelled;
          // Check cancellation policy and dates
          let today = new Date();
          if((booking.eventEID.cancellationPolicy == CancellationPolicy.flexible && 
            isWithinRange(subDays(today, 0), subDays(booking.eventEID.fromDate,7), subDays(booking.eventEID.fromDate,0))) ||
          (booking.eventEID.cancellationPolicy == CancellationPolicy.strict && 
            isWithinRange(subDays(today, 0), subDays(booking.eventEID.fromDate,30), subDays(booking.eventEID.fromDate,0)))) {
            // Charge
            this.stripeService.cancelBookingFee(booking, PaymentStatus.host_cancel).then((success: boolean) => {
              if(success) {
                this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                  // If payment of fee was successful, push a new status
                  this.events[eventIndex].cancelledPaymentStatues.push(status);
                  // Move the booking from confirmations to cancellations
                  this.events[eventIndex].confirmations.splice(bookingIndex,1);
                  this.events[eventIndex].cancellations.push(booking);
                  this.events[eventIndex].cancellationNotifications++;
                  let snackBarRef = this.snackBar.open('Cancellation fee charged!', "", {
                    duration: 1500,
                  });
                  // Update the model and send a notification if the model updates correctly
                  this.bookingService.updateBooking(booking).then(() => {
                    // Send notification to artist
                    this.createNotificationForArtist(booking, result.response, ['/bookingmanagement', 'myperformances'],
                    'event_busy', booking.performerUser.firstName + " has cancelled the confirmed booking for " + booking.eventEID.eventName + " and a 15% fee was charged.");
                  });
                });

              } else {
                // Fee charge failed
                let snackBarRef = this.snackBar.open('Payment of fee failed.', "", {
                  duration: 1500,
                });
              }
            });
          } else {
            // Asynchronously update
            // Update the booking asynchronously
            this.bookingService.updateBooking(booking).then(() => {
              // Update the model of the component
              this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                this.events[eventIndex].confirmations.splice(bookingIndex,1);
                this.events[eventIndex].cancelledPaymentStatues.push(status);
                this.events[eventIndex].cancellations.push(booking);
                this.events[eventIndex].cancellationNotifications++;
                this.createNotificationForArtist(booking, result.response, ['/events', booking.eventEID._id],
                'import_export', booking.hostUser.firstName + " has cancelled the confirmed booking for " + booking.eventEID.eventName);
              });
            });
          }
        } else {
          // No change, the user kept their confirmed booking
        }
      }
    });
  }

  createNotificationForArtist(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(null, booking.hostUser, booking.performerUser, booking.eventEID._id,
    booking, response, message, icon, new Date(), route);
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

  createNotificationForOtherPersistenHosts(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(null, booking.hostUser, booking.performerUser, booking.eventEID._id,
    booking, response, message, icon, new Date(), route);
    this._socketService.sendNotification(SocketEvent.NOTIFY_OTHER_HOSTS_BID_ACCEPTED, notification);
  }

  messageArtist(booking:Booking){
    let message:Message = {
      to: booking.performerUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  showPayDialog(booking: Booking) {
    this.canPay = false;
    let dialogRef: MatDialogRef<ConfirmPaymentDialogComponent>;
    dialogRef = this.dialog.open(ConfirmPaymentDialogComponent, {
        width: '250px',
        disableClose: false,
        data: { booking }
    });
    if(this.paySubscription) {
      this.paySubscription.unsubscribe();
      this.paySubscription = null;
    }
    this.paySubscription = dialogRef.afterClosed().subscribe(result => {
      this.updatePaymentStatues(booking);
      this.canPay = true;
    });
  }

  showPaymentHistoryDialog(booking: Booking) {
    let userID = this.userService.user._id;
    let dialogRef: MatDialogRef<PaymentHistoryDialogComponent>;
    this.stripeService.getBookingPayments(booking).then((payments: Payment[]) => {
      dialogRef = this.dialog.open(PaymentHistoryDialogComponent, {
          width: '420px',
          disableClose: false,
          data: { payments, userID }
      });

    });

  }

}

