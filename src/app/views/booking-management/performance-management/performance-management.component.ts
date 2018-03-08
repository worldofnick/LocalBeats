// Angular Modules
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";
import { MatTabChangeEvent, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// Services
import { UserService } from 'app/services/auth/user.service';
import { BookingService } from 'app/services/booking/booking.service';
import { EventService } from 'app/services/event/event.service';
import { SocketService } from 'app/services/chats/socket.service';
import { StripeService } from 'app/services/payments/stripe.service';
import { ReviewService } from 'app/services/reviews/review.service';

// Data Models
import { User } from 'app/models/user';
import { Review } from 'app/models/review';
import { Event, CancellationPolicy } from 'app/models/event';
import { Booking, StatusMessages, NegotiationResponses, VerificationResponse, BookingType } from 'app/models/booking';
import { Action } from 'app/services/chats/model/action'
import { SocketEvent } from 'app/services/chats/model/event'
import { Notification } from 'app/models/notification'
import { Message } from 'app/services/chats/model/message';
import { MessageTypes } from 'app/services/chats/model/messageTypes';
import { Payment, PaymentStatus } from 'app/models/payment'

// Components
import { RefundPaymentDialogComponent } from '../refund-payment-dialog/refund-payment-dialog.component';
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
  selector: 'app-performance-management',
  templateUrl: './performance-management.component.html',
  styleUrls: ['./performance-management.component.css']
})
export class PerformanceManagementComponent implements OnInit {
  // User Model
  user: User;
  socketSubscription: ISubscription;
  negotiationSubscription: ISubscription;
  verificationSubscription: ISubscription;
  reviewSubscription: ISubscription;
  paySubscription: ISubscription;
  private canRefund: boolean = true;
  // Performances of the User Model
  performances: {
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
    cancelledPaymentStatues: PaymentStatus[]};

  constructor(private eventService: EventService, 
    private userService: UserService,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    private stripeService: StripeService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
    ) {
      // Set user model to the authenticated singleton user
      this.user = this.userService.user;
      // Get the performances of the user
      this.performances = {
        applications: [],
        applicationNotifications: 0,
        requests: [],
        requestNotifications: 0,
        confirmations: [],
        confirmationNotifications: 0,
        completions: [],
        completionNotifications: 0,
        cancellations: [],
        cancellationNotifications: 0,
        paymentStatues: [],
        cancelledPaymentStatues: []};
      this.getPerformances();
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
      // Update payment status
    let idx = -1
    idx = this.performances.completions.findIndex(b => b._id == booking._id);
    if(idx > -1) {
      this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
        this.performances.paymentStatues[idx] = status;
        if(booking.completed && status == PaymentStatus.paid && booking.bothReviewed) {
          booking.hostStatusMessage = StatusMessages.completed;
          booking.artistStatusMessage = StatusMessages.completed;
        } else if(booking.completed && status == PaymentStatus.paid) {
          if(booking.beenReviewedByArtist) {
            booking.artistStatusMessage = StatusMessages.reviewed;
            booking.hostStatusMessage = StatusMessages.needsReview;
          } else if(booking.beenReviewedByHost) {
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.hostStatusMessage = StatusMessages.reviewed;
          } else {
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.hostStatusMessage = StatusMessages.needsReview;
          }
        } else if(status == PaymentStatus.refund) {
          booking.hostStatusMessage = StatusMessages.refund;
          booking.artistStatusMessage = StatusMessages.refund;
        }
        this.bookingService.updateBooking(booking);
      });
    } else {
      idx = this.performances.cancellations.findIndex(b => b._id == booking._id);
      this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
        this.performances.cancelledPaymentStatues[idx] = status;
        booking.artistStatusMessage = StatusMessages.cancelled;
        booking.hostStatusMessage = StatusMessages.cancelled;
        this.bookingService.updateBooking(booking);
      })
    }
  }

  reviewDialog(booking: Booking) {
    let review: Review = new Review;
    review.booking = booking;
    review.toUser = booking.hostUser;
    review.fromUser = booking.performerUser;
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
          booking.beenReviewedByArtist = true;
          booking.hostStatusMessage = StatusMessages.needsReview;
          booking.artistStatusMessage = StatusMessages.reviewed;
          booking.artViewed = true;
          booking.hostViewed = false;
          if(booking.beenReviewedByHost){
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
    this.reviewService.getReviewsFrom(booking.performerUser).then( (reviews) => {
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
            booking.beenReviewedByArtist = false;
            this.bookingService.updateBooking(booking);
          });
        }else {
          this.reviewService.updateReview(reviewToEdit);
        }
      });
    }); 
  }

  /* 
  Retrieves all of the performance bookings of the user
  Booking Cases:
  1. Applications
  2. Requests
  3. Confirmations
  4. Completions
  5. Cancellations
  Notifications occur if artistViewed boolean is false in the booking model
  */
  private getPerformances() {
    // Get all performances associated with the user
    this.bookingService.getUserBookings(this.userService.user, 'artist').then((bookings: Booking[]) => {
      // Get the confirmed bookings
      let confirmedBookings: Booking[] = [];
      // Get the application bookings
      let applicationBookings: Booking[] = [];
      // Get the request bookings
      let requestBookings: Booking[] = [];
      // Get the completed bookings
      let completedBookings: Booking[] = [];
      // Get the cancelled bookings
      let cancelledBookings: Booking[] = [];
      // Get the notification counts
      let numNotif: number = 0;
      let reqNotif: number = 0;
      let numConf: number = 0;
      let cancelNotif: number = 0;
      let completeNotif: number = 0;
      let paymentStatues: PaymentStatus[] = [];
      let cancelledPaymentStatues: PaymentStatus[] = [];
      for(let booking of bookings) {
        if(booking.approved) {
          if(booking.completed) {
            completedBookings.push(booking);
            // If the booking is completed and has not yet been viewed by the artist, a new notification exists
            if(!booking.artViewed) {
              completeNotif++;
            }
            // If a booking is completed, it should have a payment status
            this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
              paymentStatues.push(status);
            });
          } else if(!booking.cancelled) {
            confirmedBookings.push(booking);
            // If the booking is confirmed and has not yet been viewed by the artist, a new notification exists
            if(!booking.artViewed) {
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
            // If the booking is not confirmed and the host has approved, a new notification exists
            if(booking.hostApproved) {
              numNotif++;
            }
          } else {
            // Otherwise, it was a host request
            requestBookings.push(booking);
            // If the booking is not confirmed and the host has approved, a new notification exists
            if(booking.hostApproved) {
              reqNotif++;
            }
          }
        }
      }
      this.performances = {
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
        cancelledPaymentStatues: cancelledPaymentStatues};
    });
  }

  /*
  Receives a response and a new booking from the subscription to the socket
  Updates the component model in real-time according to the negotiation response
  Negotiation Cases:
  1. New Bid/Application - find if already on applications/requests, otherwise push onto applications/requests
  2. Accepted by Host, Booking Approved - splice booking from applications/requests and push onto confirmations
  3. Declined - find in applications/requests and splice it
  4. Cancelled - find in applications/requests/confirmations, splice it
  5. Complete - host has done final verification, find in confirmations, splice it, and push onto completions, update payment statuses
  6. Verification - host has verified, but artist has yet to verify, update confirmations with a notification
  7. Payment - a refund has occurred from the artist, update the completed booking and payment statuses
  */
  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let applicationIndex: number = -1;
    let requestIndex: number = -1;
    let confirmationIndex: number = -1;
    let completionIndex: number = -1;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id)
      applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
      // Remove from applications/requests and put on confirmations
      if(newBooking.bookingType == BookingType.artistApply) {
        this.performances.applications.splice(applicationIndex, 1);
      } else {
        this.performances.requests.splice(requestIndex, 1);
      }
      this.performances.confirmations.push(newBooking);
      this.performances.confirmationNotifications++;

    } else if(response == NegotiationResponses.new) {
      // Otherwise, check if there is a new bid or offer
      requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id);
      applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
      if(applicationIndex >= 0) {
        // Then it must be a performance with a current application
        // Update this event
        if(this.performances.applications[applicationIndex].hostApproved != newBooking.hostApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.performances.applicationNotifications++;
        }
        this.performances.applications[applicationIndex] = newBooking;
      } else if(requestIndex >= 0){
        // Then it is an event with a current request
        // Update this event
        if(this.performances.requests[requestIndex].hostApproved != newBooking.hostApproved) {
          // Increment the notifications only if there wasn't a previous one before the host responded
          this.performances.requestNotifications++;
        }
        this.performances.requests[requestIndex] = newBooking;
      } else {
        // Otherwise, it is a brand new application/request
        // Push onto applications/requests
        if(newBooking.bookingType == BookingType.artistApply) {
          this.performances.applications.push(newBooking);
          // Increment the notifications
          this.performances.applicationNotifications++;
        } else {
          this.performances.requests.push(newBooking);
          // Increment the notifications
          this.performances.requestNotifications++;
        }
        
      }
    } else if(response == NegotiationResponses.decline) {
      // Find it in applications and remove it
      if(newBooking.bookingType == BookingType.artistApply) {
        applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
        this.performances.applications.splice(applicationIndex, 1);
      } else {
        // Otherwise, it was a request, remove it
        requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id);
        this.performances.requests.splice(requestIndex, 1);
      }
    } else if(response == NegotiationResponses.cancel) {
      confirmationIndex = this.performances.confirmations.findIndex(a => a._id == newBooking._id);
      // The host has cancelled
      this.performances.confirmations.splice(confirmationIndex, 1);
      this.performances.cancellationNotifications++;
      this.performances.cancellations.push(newBooking);
      // If a booking is cancelled, check its payment status
      this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
        this.performances.cancelledPaymentStatues.push(status);
      })
    } else if(response == NegotiationResponses.complete) {
      // Find it in confirmations
      confirmationIndex = this.performances.confirmations.findIndex(a => a._id == newBooking._id);
      // The artist has verified and the booking is complete
      this.performances.confirmations.splice(confirmationIndex,1);
      this.performances.completionNotifications++;
      this.performances.completions.push(newBooking);
      // Get the payment statuses
      // If a booking is complete, it should have a payment status
      this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
        this.performances.paymentStatues.push(status);
      });

    } else if(response == NegotiationResponses.verification) {
      // Find it in confirmations
      confirmationIndex = this.performances.confirmations.findIndex(a => a._id == newBooking._id);
      // The host has either verified or not, update the booking so the artist is aware
      this.performances.confirmations[confirmationIndex] = newBooking;
      this.performances.confirmationNotifications++;
    } else if(response == NegotiationResponses.payment) {
      // Update payment status of completed booking because a payment has happened
      if(!newBooking.cancelled) {
        completionIndex = this.performances.completions.findIndex(a => a._id == newBooking._id);
        this.bookingService.bookingPaymentStatus(newBooking).then((status: PaymentStatus) => {
          this.performances.completions[completionIndex] = newBooking;
          this.performances.completionNotifications++;
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
          } else if(status == PaymentStatus.refund) {
            newBooking.hostStatusMessage = StatusMessages.refund;
            newBooking.hostStatusMessage = StatusMessages.refund;
          }
          this.bookingService.updateBooking(newBooking);
          this.performances.paymentStatues[completionIndex] = status;
        });
      }
    } else if (response == NegotiationResponses.review) {
      completionIndex = this.performances.completions.findIndex(a => a._id == newBooking._id);
      this.performances.completions[completionIndex] = newBooking;
      if(!newBooking.artViewed) {
        this.performances.completionNotifications++;
      }
    }
  }

  /*
  Takes user to event singleton view page
  */
  onViewEvent(event:Event){
    this.router.navigate(['/events', event._id]);
  }

  resetNotifications(event: MatTabChangeEvent) {
    if(event.index == 2) {
      this.performances.confirmationNotifications = 0;
      for(let booking of this.performances.confirmations) {
        if(!booking.artViewed) {
          booking.artViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    } else if(event.index == 3) {
      this.performances.completionNotifications = 0;
      for(let booking of this.performances.completions) {
        if(!booking.artViewed) {
          booking.artViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    } else if(event.index == 4) {
      this.performances.cancellationNotifications = 0;
      for(let booking of this.performances.cancellations) {
        if(!booking.artViewed) {
          booking.artViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    }
  }

  /*
  Artist verifies that the host and event of the confirmed booking are as they should be
  Cases:
  1. Verified and the Host has not verified - send a verification notification to host
  2. Verified and the Host has verified - complete the booking and send payment to host
  */
  artistVerify(booking: Booking, bookingIndex: number) {
    if(this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }
    this.verificationSubscription = this.bookingService.verify(booking, false)
    .subscribe((result)=> {
      // Check to see if a response was recorded in the verification dialog box
      if(result != undefined) {
        // Check to see what the response was
        if(result.comment != null && result.comment != undefined) {
          let privateMessage: Message = this.commentToHost(result.comment, booking);
          this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
        }
        let notificationMessage: string = '';
        let response:NegotiationResponses = null;
        if(result.response == VerificationResponse.verify) {
          // The artist has verified the host's attendance
          booking.artistVerified = true;
          // If host has verified, the booking is complete
          if(booking.hostVerified) {
            booking.hostStatusMessage = StatusMessages.needsReview;
            booking.artistStatusMessage = StatusMessages.needsReview;
            booking.completed = true;
            booking.hostViewed = false;
            booking.artViewed = false;
            notificationMessage = "You've paid " + booking.performerUser.firstName + " for the event " + booking.eventEID.eventName + ". Please go and submit a review to complete the booking.";
            response = NegotiationResponses.complete;
          } else {
            booking.hostStatusMessage = StatusMessages.artistVerified;
            booking.artistStatusMessage = StatusMessages.waitingOnHost;
            booking.artViewed = true;
            booking.hostViewed = false;
            notificationMessage = booking.performerUser.firstName + " has verified you for the event " + booking.eventEID.eventName;
            response = NegotiationResponses.verification;
          }
        } else {
          // The artist has rejected verification of the host
          booking.hostStatusMessage = StatusMessages.artistRejected;
          booking.artistStatusMessage = StatusMessages.artistRejected;
          booking.artViewed = true;
          booking.hostViewed = false;
          booking.artistVerified = false;
          notificationMessage = booking.performerUser.firstName + " has invalidated you for the event " + booking.eventEID.eventName;
          response = NegotiationResponses.verification;
        }
        // Update the booking and payment asynchronously
        if(booking.completed) {
          this.stripeService.charge(booking, true).then((success: boolean) => {
            if (success) {
              this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                // If payment was successful, push a new status
                this.performances.paymentStatues.push(status);
                // Move the booking from confirmations to completions
                this.performances.confirmations.splice(bookingIndex, 1);
                this.performances.completions.push(booking);
                let snackBarRef = this.snackBar.open('Payment received!', "", {
                  duration: 1500,
                });
                // Update the model and send a notification if the model updates correctly
                this.bookingService.updateBooking(booking).then(() => {
                  // Send notification to artist
                  this.createNotificationForHost(booking, response, ['/bookingmanagement', 'myevents'],
                  'event_available', notificationMessage);
                });
              });
            } else {
              // Payment failed, so change the booking to not be completed
              booking.completed = false;
              booking.hostStatusMessage = StatusMessages.unpaid;
              booking.artistStatusMessage = StatusMessages.unpaid;
              this.performances.confirmations[bookingIndex] = booking;
              // Don't push a payment status, because the payment failed
              notificationMessage = "Your booking is incomplete, please try to pay " + booking.performerUser.firstName + " for the event " + booking.eventEID.eventName + " again";
              let snackBarRef = this.snackBar.open('Payment failed, please ask host to try again.', "", {
                duration: 1500,
              });
              // Update the model and send a notification if the model updates correctly
              this.bookingService.updateBooking(booking).then(() => {
                // Send notification to artist
                this.createNotificationForHost(booking, response, ['/bookingmanagement', 'myevents'],
                'event_available', notificationMessage);
              });
            }
          });
        } else {
          // Otherwise, the booking is not complete, so just a normal verification happened
          this.performances.confirmations[bookingIndex] = booking;
          // Update the model and send a notification if the model updates correctly
          this.bookingService.updateBooking(booking).then(() => {
            // Send notification to artist
            this.createNotificationForHost(booking, response, ['/bookingmanagement', 'myevents'],
            'event_available', notificationMessage);
          });
        }
      }
    })
  }

  /*
  Artist responds to applications/bids through negotiation dialog
  */
  openNegotiationDialog(booking: Booking, bookingIndex: number) {
    let view = "artist";
    if(this.negotiationSubscription) {
      this.negotiationSubscription.unsubscribe();
    }
    this.negotiationSubscription = this.bookingService.negotiate(booking, false, view, "")
    .subscribe((result) => {
      // Check to see if a response was recorded in the negotiation dialog box
      if (result != undefined) {
        if(result.comment != null && result.comment != undefined) {
          let privateMessage: Message = this.commentToHost(result.comment, booking);
          this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
        }
        // Check to see what the response was
        if (result.response == NegotiationResponses.new) {
          // New, the user offered a new monetary amount to the host
          // Set the new price
          booking.currentPrice = result.price;
          // Swap the approvals so that the host now needs to approve the new price
          booking.hostApproved = false;
          booking.hostStatusMessage = StatusMessages.artistBid
          booking.artistApproved = true;
          booking.artistStatusMessage = StatusMessages.waitingOnHost;
          booking.artViewed = true;
          booking.hostViewed = false;
          // Update the booking asynchronously
          this.bookingService.updateBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == BookingType.artistApply) {
              this.performances.applications[bookingIndex] = booking;
              this.performances.applicationNotifications--;
            } else {
              this.performances.requests[bookingIndex] = booking;
              this.performances.requestNotifications--;
            }
            this.createNotificationForHost(booking, result.response, ['/bookingmanagement', 'myevents'],
            'import_export', booking.performerUser.firstName + " has made a new bid on " + booking.eventEID.eventName);
          });
        } else if (result.response == NegotiationResponses.accept) {
          // Accept, the user accepted an offer from the host or they reconfirmed their previous bid
          // No price change
          // Check to see if it was already host approved, otherwise no change
          booking.artistApproved = true;
          if(booking.hostApproved) {
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
                this.performances.applications.splice(bookingIndex, 1);
                this.performances.applicationNotifications--;
              } else {
                this.performances.requests.splice(bookingIndex, 1);
                this.performances.requestNotifications--;
              }
              this.performances.confirmations.push(booking);
              this.performances.confirmationNotifications++;
              this.createNotificationForHost(booking, result.response, ['/bookingmanagement', 'myevents'],
              'event_available', booking.performerUser.firstName + " has confirmed the booking " + booking.eventEID.eventName);
            })
          }
        } else if (result.response == NegotiationResponses.decline) {
          // Decline, the user declined an offer from the host
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == BookingType.artistApply) {
              this.performances.applications.splice(bookingIndex, 1);
              this.performances.applicationNotifications--;
            } else {
              this.performances.requests.splice(bookingIndex, 1);
              this.performances.requestNotifications--;
            }
            this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
            'event_busy', booking.performerUser.firstName + " has cancelled the request on " + booking.eventEID.eventName);
          })
        } else if(result.response == NegotiationResponses.cancel) {
          // Cancellation, the user cancelled a confirmed booking
          // Negate approvals for real-time notification to other user's component model
          booking.cancelled = true;
          booking.artViewed = true;
          booking.hostViewed = false;
          booking.hostStatusMessage = StatusMessages.cancelled;
          booking.artistStatusMessage = StatusMessages.cancelled;
          // Check cancellation policy and dates
          let today = new Date();
          if((booking.eventEID.cancellationPolicy == CancellationPolicy.flexible && 
            isWithinRange(subDays(today, 0), subDays(booking.eventEID.fromDate,7), subDays(booking.eventEID.fromDate,0))) ||
          (booking.eventEID.cancellationPolicy == CancellationPolicy.strict &&
             isWithinRange(subDays(today, 0), subDays(booking.eventEID.fromDate,30), subDays(booking.eventEID.fromDate,0)))) {
            this.stripeService.cancelBookingFee(booking, PaymentStatus.artist_cancel).then((success: boolean) => {
              if(success) {
                this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
                  // If payment of fee was successful, push a new status
                  this.performances.cancelledPaymentStatues.push(status);
                  // Move the booking from confirmations to cancellations
                  this.performances.confirmations.splice(bookingIndex,1);
                  this.performances.cancellations.push(booking);
                  this.performances.cancellationNotifications++;
                  let snackBarRef = this.snackBar.open('Cancellation fee charged!', "", {
                    duration: 1500,
                  });
                  // Update the model and send a notification if the model updates correctly
                  this.bookingService.updateBooking(booking).then(() => {
                    // Send notification to artist
                    this.createNotificationForHost(booking, result.response, ['/bookingmanagement', 'myevents'],
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
            // Create notification for host
            this.bookingService.updateBooking(booking).then(() => {
            // Update the model of the component
            this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
              // If payment of fee was successful, push a new status
              this.performances.cancelledPaymentStatues.push(status);
              this.performances.confirmations.splice(bookingIndex,1);
              this.performances.cancellations.push(booking);
              this.performances.cancellationNotifications++;
              this.createNotificationForHost(booking, result.response, ['/bookingmanagement', 'myevents'],
              'event_busy', booking.performerUser.firstName + " has cancelled the confirmed booking for " + booking.eventEID.eventName + " and no fee was charged.");
            });
          });
          }
        } else {
          // No change, the user kept their confirmed booking
        }
      }
    });
  }

  commentToHost(comment: string, booking:Booking): Message {
    let message:Message = {
      to: booking.hostUser,
      from: this.userService.user,
      content: comment,
      action: Action.SEND_PRIVATE_MSG,
      isRead: false,    
      sentAt: new Date(Date.now()),
      messageType: MessageTypes.MSG
    }
    return message;
  }
  
  createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(null, booking.performerUser, booking.hostUser, booking.eventEID._id,
    booking, response, message, icon, new Date(), route); 
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

  messageHost(booking:Booking){
    let message:Message = {
      to: booking.hostUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  showRefundDialog(booking: Booking) {
    this.canRefund = false;
    let dialogRef: MatDialogRef<RefundPaymentDialogComponent>;
    dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
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
      this.canRefund = true;
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