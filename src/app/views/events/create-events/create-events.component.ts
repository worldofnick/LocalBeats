import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ImgurService } from 'app/services/image/imgur.service';


@Component({
  selector: 'app-create-events',
  templateUrl: './create-events.component.html',
  styleUrls: ['./create-events.component.css']
})
export class CreateEventsComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  formData = {}
  console = console;
  basicForm: FormGroup;
  event:Event;
  user:User;
  eventID;
  EID: any;  
  submitButtonText:string
  updating:Boolean

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private bookingService: BookingService,
              private eventService: EventService,
              private router: Router,
              private imgurService: ImgurService
              ) { }

  ngOnInit() {

    this.user = this.userService.user;

    this.event = new Event;

    this.EID = {
      id: this.route.snapshot.params['id']
    }

    let ID = this.EID["id"];
    if (ID == null) {
      // console.log("creating event");
      this.updating = false;
    } else {
      // console.log(ID);
      this.updating = true;
    }

    if (this.updating) {
      this.eventService.getEventByEID(this.EID).then((eventEdit: Event) => {
        this.event = eventEdit;
        // console.log(this.model);
        // this.user = event.hostUser;
      });
    }
    
    this.basicForm = new FormGroup({
      eventName: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(40),
        Validators.required
      ]),
      eventType: new FormControl('', [
        Validators.required
      ]),
      fixedPrice: new FormControl('', [
        // Validators.required,
      ]),
      negotiable: new FormControl('', [
        Validators.required
      ]),
      eventGenre: new FormControl('', [
        Validators.required,
      ]),
      date: new FormControl(),
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if(!agreed) {
          return { agreed: true }
        }
        return null;
      })
    })


  }

  onChange(event: EventTarget) {
      this.progressBar.mode = 'indeterminate';
      let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
      let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
      let files: FileList = target.files;
      let file: File = files[0];
      let blob = file as Blob;

      this.imgurService.uploadToImgur(file).then(link => {
        this.event.eventPicUrl = link as string;
      }).then(link => {
          this.progressBar.mode = 'determinate';
          // update the image view
        }).catch(err => {
          console.log(err);
          this.progressBar.mode = 'determinate';
          //this.router.navigate(['/profile']); //this will go back to my events.
      });
  }

  onCreateEvent(form: NgForm) {
    this.event.eventName = this.basicForm.controls.eventName.value;
    this.event.eventGenre = this.basicForm.controls.eventGenre.value;
    this.event.eventType = this.basicForm.controls.eventType.value;
    this.event.fixedPrice = this.basicForm.controls.fixedPrice.value;
    this.event.toDate = this.basicForm.controls.date.value;
    this.event.negotiable = this.basicForm.controls.negotiable.value;

    this.event.hostUser = this.user;
    this.event.hostEmail = this.user.email;

    if (!this.updating) {
      this.eventService.createEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;
        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]); //this will go to the page about the event
      });
    } else {
      this.eventService.updateEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;
        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]); //this will go to the page about the event
      });
    }
  }
}
