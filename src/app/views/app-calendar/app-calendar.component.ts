import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { Subject } from 'rxjs/Subject';
import { Router } from "@angular/router";

// Models
import { Event } from 'app/models/event';
import { Booking } from 'app/models/booking';

// Services
import { EventService } from 'app/services/event/event.service';
import { UserService } from 'app/services/auth/user.service';
import { BookingService } from 'app/services/booking/booking.service';



import { MatDialog, MatDialogRef } from '@angular/material';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';

@Component({
  selector: 'app-calendar',
  templateUrl: './app-calendar.component.html',
  styleUrls: ['./app-calendar.component.css']
})
export class AppCalendarComponent implements OnInit {
  view = 'month';
  viewDate = new Date();

  events: CalendarEvent[] = [];
  userEvents: Event[];
  modalData: {
    action: string,
    event: CalendarEvent
  };

  colors: any = {
    red: {
      primary: '#f44336',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#247ba0 ',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#ffd97d',
      secondary: '#FDF1BA'
    }
  };

  actions: CalendarEventAction[] = [{
    label: '<i class="material-icons icon-sm">edit</i>',
    onClick: ({ event }: { event: CalendarEvent }): void => {
      this.handleEvent('Edited', event);
    }
  },
  {
    label: '<i class="material-icons icon-sm">event_available</i>',
    onClick: ({ event }: { event: CalendarEvent }): void => {
      this.handleEvent('Events', event);
    }
  }
    ]  ;

  bookingActions: CalendarEventAction[] = [{
    label: '<i class="material-icons icon-sm">visibility</i>',
    onClick: ({ event }: { event: CalendarEvent }): void => {
      this.handleEvent('Singleton', event);
    }
  },
  {
    label: '<i class="material-icons icon-sm">event_note</i>',
    onClick: ({ event }: { event: CalendarEvent }): void => {
      this.handleEvent('Bookings', event);
    }
  }

];

  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = true;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  dialogRef;

  constructor(public dialogBox: MatDialog, private eventService: EventService,
    private userService: UserService, private bookingService: BookingService,
    private router: Router) { }


  ngOnInit() {
    this.eventService.getEventsByUID(this.userService.user._id).then( (eventList: Event[]) => {
      for (let event of eventList) {
        const calendarEvent: CalendarEvent = {
          start: subDays(event.fromDate, 0),
          end: subDays(event.toDate,0),
          title: event.eventName,
          color: this.colors.red,
          actions: this.actions,
          meta: event._id
        };
        this.events.push(calendarEvent);
      }

      if(this.userService.user.isArtist) {
        this.bookingService.getUserBookings(this.userService.user, 'artist').then( (bookings: Booking[]) => {
          for(let booking of bookings){
            const calendarEvent: CalendarEvent = {
              start: subDays(booking.eventEID.fromDate, 0),
              end: subDays(booking.eventEID.toDate, 0),
              title: booking.eventEID.eventName,
              color: this.colors.yellow,
              actions: this.bookingActions,
              meta: booking.eventEID._id
            };
            this.events.push(calendarEvent);
          }
          this.refresh.next();
        });
      }
    });

  }


  handleEvent(action: string, event: CalendarEvent): void {
    if (action == 'Edited') {
      this.router.navigate(['/events', 'update', event.meta]); // this will go to the page about the event
    } else if (action == 'Singleton') {
      this.router.navigate(['/events', event.meta]); // this will go to the page about the event
    } else if (action == 'Bookings') {
      this.router.navigate(['/bookingmanagement', 'myperformances']); // this will go to the page about the event
    } else if (action == 'Events') {
      this.router.navigate(['/bookingmanagement', 'myevents']); // this will go to the page about the event
    }
  }
  dayClicked({ date, events }: { date: Date, events: CalendarEvent[] }): void {

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }
  closeDialog() {
    this.dialogBox.closeAll();
  }
}
