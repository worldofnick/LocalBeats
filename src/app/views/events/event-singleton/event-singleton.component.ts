import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from '@angular/common'
import { Router } from "@angular/router";


import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { Booking, StatusMessages, NegotiationResponses, BookingType } from '../../../models/booking';
import { Action } from '../../../services/chats/model/action'
import { SocketEvent } from '../../../services/chats/model/event'
import { Notification } from '../../../models/notification'
import { SocketService } from '../../../services/chats/socket.service';
import { Message } from '../../../services/chats/model/message';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-event-singleton',
  templateUrl: './event-singleton.component.html',
  styleUrls: ['./event-singleton.component.css']
})
export class EventSingletonComponent implements OnInit {

  public model: Event = new Event;
  public user: User = new User;
  public userBooking: Booking;
  public isCurrentUser: boolean = null;
  public hasApplied: boolean = null;
  public dateInBar: Date;
  public zoom: number;
  public lat: number;
  public lng: number;
  EID: any;
  buttonText: string = "Apply";
  setLocation = false;

  constructor(private eventService: EventService,
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.EID = {
      id: this.route.snapshot.params['id']
    }

    this.eventService.getEventByEID(this.EID).then((event: Event) => {
      this.model = event;
      this.lat = this.model.location[1]
      this.lng = this.model.location[0]
      this.zoom = 12;
     
      this.user = event.hostUser;
      if (this.userService.user != null && this.user._id === this.userService.user._id) {
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    }).then(() => {
      if(this.userService.isAuthenticated()) {
        this.getBooking()
        this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
        .subscribe((notification: Notification) => {
          
          if (notification.response != NegotiationResponses.payment) {
            this.updateModel(notification.booking, notification.response);
          }
          
        });
      }
    });
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    this.userBooking = newBooking;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      this.buttonText = "Cancel Booking";
    } else if(response == NegotiationResponses.new) {
      // Otherwise, check if there is a new bid or offer
      this.buttonText = "View Application";
    } else if(response == NegotiationResponses.decline || response == NegotiationResponses.cancel) {
      if(this.model.negotiable) {
        this.buttonText = "Bid";
      } else {
        this.buttonText = "Apply";
      }
      this.hasApplied = false;
      this.userBooking = null;
    }
  }

  private getBooking() {
    this.bookingService.getBooking(this.model).then((bookings: Booking[]) => {
      this.userBooking = bookings.find(b => b.performerUser._id == this.userService.user._id);
      // If a booking exists, then the current user has applied to this event
      if(this.userBooking != null) {
        this.hasApplied = true;
      } else {
        this.hasApplied = false;
      }
      // If they haven't applied to this event, change the application text
      if (!this.hasApplied) {
        if (this.model.negotiable) {
          this.buttonText = "Bid";
        } else {
          this.buttonText = "Apply";
        }
      } else if(this.userBooking.approved){
        // If they have applied and have been approved, change button to cancellation
        this.buttonText = "Cancel Booking";
      } else {
        // If they have applied and have not yet been approved, change button to view of application
        this.buttonText = "View Application";
      }
    })
  }

  messageHost(){
    let message:Message = {
      to: this.model.hostUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  onSelectHost(){
    if(this.isCurrentUser){
      this.router.navigate(['/profile'])
    }else{
      this.router.navigate(['/profile', this.model.hostUser._id])
    }
  }

  onEditEvent() {
    this.router.navigate(['/events', 'update', this.model._id]); //this will go to the page about the event
  }

  onDeleteEvent() {
    this.eventService.deleteEventByEID(this.model).then((status: Number) => {
      if (status == 200) {
        this.router.navigate(['/profile']);
        this.model = null;
      }
    });
  }

  newApplication() {
    this.userBooking = new Booking(undefined, BookingType.artistApply, this.model.hostUser, this.userService.user, this.model, false, false, false, StatusMessages.artistBid, StatusMessages.waitingOnHost, true, false, this.model.fixedPrice, null, null);
    this.bookingService.negotiate(this.userBooking, true, "artist").subscribe((result) => {
      if (result != undefined) {
        if (result.response == NegotiationResponses.new) {
          this.userBooking.currentPrice = result.price;
          this.bookingService.createBooking(this.userBooking).then((booking: Booking) => {
            // Flag application
            this.hasApplied = true;
            this.userBooking = booking;
            this.buttonText = 'View Application';
            // Send notification to host
            let message = '';
            if(this.model.negotiable) {
              message = booking.hostUser.firstName + " has bid on your event called: " + booking.eventEID.eventName;
            } else {
              message = booking.hostUser.firstName + " has applied to your event called: " + booking.eventEID.eventName;
            }
            this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
            'queue_music', message);
          });
        }
      }
    });
  }

  openNegotiationDialog() {
    let view = this.eventService.event.hostUser._id == this.userService.user._id ? "host" : "artist";
    this.bookingService.negotiate(this.userBooking, false, view)
    .subscribe((result) => {
      // Check to see if a response was recorded in the negotiation dialog box
      if (result != undefined) {
        // Check to see what the response was
        if (result.response == NegotiationResponses.new) {
          // New, the user offered a new monetary amount to the host
          // Set the new price
          this.userBooking.currentPrice = result.price;
          // Swap the approvals so that the host now needs to approve the new price
          this.userBooking.hostApproved = false;
          if(this.model.negotiable) {
            this.userBooking.hostStatusMessage = StatusMessages.artistBid;
          } else {
            this.userBooking.hostStatusMessage = StatusMessages.artistApplication;
          }
          this.userBooking.artistApproved = true;
          this.userBooking.artistStatusMessage = StatusMessages.waitingOnHost;
          // Update the booking asynchronously
          this.bookingService.updateBooking(this.userBooking).then(() => {
            this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
            'import_export', this.userBooking.performerUser.firstName + " has updated the offer on " + this.model.eventName);
          });
        } else if (result.response == NegotiationResponses.accept) {
          // Accept, the user accepted an offer from the host or they reconfirmed their previous bid/application to the host
          // No price change
          // Check to see if it was already host approved, otherwise no change
          this.userBooking.artistApproved = true;
          if(this.userBooking.hostApproved) {
            // Confirm booking
            this.userBooking.approved = true;
            this.userBooking.hostStatusMessage = StatusMessages.bookingConfirmed;
            this.userBooking.artistStatusMessage = StatusMessages.bookingConfirmed;
            // Asynchronously update
            this.bookingService.acceptBooking(this.userBooking, view).then(() => {
              // Update the model of the component
              this.buttonText = "Cancel Booking";
              this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
              'event_available', this.userBooking.performerUser.firstName + " has confirmed the booking" + this.model.eventName);
            })
          }
        } else if (result.response == NegotiationResponses.decline) {
          // Decline, the user declined an offer from the host
          // Negate approvals for real-time notification to other user's component model
          this.userBooking.artistApproved = false;
          this.userBooking.hostApproved = false;
          this.userBooking.approved = false;
          
          // Asynchronously update
          this.bookingService.declineBooking(this.userBooking).then(() => {
            // Update the model of the component
            this.hasApplied = false;
            if(this.model.negotiable) {
              this.buttonText = "Bid";
            } else {
              this.buttonText = "Apply";
            }
            this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
            'event_busy', this.userBooking.performerUser.firstName + " has cancelled the application on " + this.model.eventName);
          })
        } else if(result.response == NegotiationResponses.cancel) {
          // Cancellation, the user cancelled a confirmed booking
          // Negate approvals for real-time notification to other user's component model
          this.userBooking.artistApproved = false;
          this.userBooking.hostApproved = false;
          this.userBooking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(this.userBooking).then(() => {
            // Update the model of the component
            this.hasApplied = false;
            if(this.model.negotiable) {
              this.buttonText = "Bid";
            } else {
              this.buttonText = "Apply";
            }
            this.createNotificationForHost(this.userBooking, result.response, ['/profile', 'events'],
            'event_busy', this.userBooking.performerUser.firstName + " has cancelled the confirmed booking on " + this.model.eventName);
          })
        } else {
          // No change, the user kept their confirmed booking
        }
      }
    });
  }

  createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(booking.performerUser, booking.hostUser, booking.eventEID._id,
      booking, response, message, icon, route); 
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

}