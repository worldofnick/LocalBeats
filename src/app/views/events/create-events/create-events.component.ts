import { Component, ElementRef,OnInit, ViewChild, NgZone } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ImgurService } from 'app/services/image/imgur.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
// import { NgZone } from '@angular/core/src/zone/ng_zone';

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
  event:Event  = new Event;
  user:User;
  eventID;
  EID: any;  
  up: any;
  submitButtonText:string
  updating:Boolean
  cityState:string;


  eventDescription: string = `<h1>Your Event Description</h1>
  <p><a href="http://mhrafi.com" target="_blank"><strong>MH Rafi</strong></a></p>
  <p><br></p><p><strong >Lorem Ipsum</strong>
  <span>
  &nbsp;is simply dummy text of the printing and typesetting industry. 
  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a 
  galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
  </span></p>`;

  latitude: number;
  longitude: number;
  public place: google.maps.places.PlaceResult
  zoom: number;

  selectedEventType: string = 'wedding';
  eventTypes = [
    { value: 'wedding', viewValue: 'Wedding' },
    { value: 'birthday', viewValue: 'Birthday' },
    { value: 'business', viewValue: 'Business' }
  ];



  checkedValues:Boolean[]
  
  // evenGenres:Array<string>;


  musicGenres: any = [{genre:'Rock', checked:false}, {genre:'Country', checked:false}, {genre:'Jazz', checked:false}, {genre:'Blues', checked:false}, {genre:'Rap', checked:false}];
  
  // loadedEventGenres: any = [{genre:'Rock', checked:false}, {genre:'Country', checked:false}, {genre:'Jazz', checked:false}, {genre:'Blues', checked:false}, {genre:'Rap', checked:false}];

  // eventTypes: any = [{genre:'Wedding', checked:false}, {genre:'Birthday', checked:false}, {genre:'Business', checked:false}];
  genres: any = this.musicGenres;

  @ViewChild("searchplaces") searchElementRef: ElementRef;
  minDate = new Date(Date.now());
  maxDate = new Date(2020, 0, 1);

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private bookingService: BookingService,
              private eventService: EventService,
              private router: Router,
              private imgurService: ImgurService,
              private formBuilder: FormBuilder,
              public snackBar: MatSnackBar,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              ) { }

              
  ngOnInit() {
  
    // this.openSnackBar();
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;
    this.user = this.userService.user;
    this.setCurrentPosition();
    this.setupMap();

    
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

        //pre load maps input box
       this.cityState = this.event.city + ',' + this.event.state + ', USA' ;

        for(let genre of this.genres){
          for(let eventGenre of this.event.eventGenres){
            if(genre.genre == eventGenre){
              genre.checked = true;
            }
          }
        }
      });
    }
    
    this.basicForm = this.formBuilder.group({
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
      eventDescription: new FormControl(),
      imageUploaded: new FormControl(),
      genres: this.formBuilder.array([]),
      location: new FormControl('',[Validators.required]),
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if(!agreed) {
          return { agreed: true }
        }
        return null;
      })
    })
  }
  
  
  openSnackBar() {
    console.log('test')
    this.snackBar.open('Create Event','next', { duration: 2000 });
  }

  setupMap() {

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          this.place = autocomplete.getPlace();
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // place.address_components
          // place.formatted_address
          this.basicForm.setControl('location', new FormControl(place.formatted_address))
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
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

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  onPickingGenre(event) {
    const genres = <FormArray>this.basicForm.get('genres') as FormArray;

    if(event.checked) {
      event.source.value.checked = true;
      genres.push(new FormControl(event.source.value))
    } else {
      event.source.value.checked = false;
      const i = genres.controls.findIndex(x => x.value === event.source.value);
      genres.removeAt(i);
    }
  }


  onContentChanged() { }
  onSelectionChanged() { }


  onCreateEvent(form: NgForm) {


    this.event.location = [this.longitude, this.latitude]

    if(this.place){

      const city = this.place.address_components[0].long_name
      const state = this.place.address_components[2].short_name
      this.event.state = state;
      this.event.city = city;
    }
    // console.log("creating this event: ")
    
    this.event.eventName = this.basicForm.controls.eventName.value;
    // this.event.eventGenre = this.basicForm.controls.eventGenre.value;
    this.event.eventType = this.basicForm.controls.eventType.value;
    this.event.fixedPrice = this.basicForm.controls.fixedPrice.value;
    this.event.toDate = this.basicForm.controls.date.value;
    this.event.negotiable = this.basicForm.controls.negotiable.value;

    this.event.hostUser = this.user;
    this.event.hostEmail = this.user.email;

    // console.log(this.event);

    const genres = <FormArray>this.basicForm.get('genres') as FormArray;
    // this.event.eventGenre = genres;


  ///////////////////////////

    // console.log("genres picked for event:")
    // console.log(this.basicForm.get('genres').value);
    // this.event.eventGenres = this.basicForm.get('genres').value;

    let tempGenres:string[] = [];
    for(let picked of this.basicForm.get('genres').value){
      tempGenres.push(picked.genre);
    }

    this.event.eventGenres = tempGenres;

    /////////////////
    


    if (!this.updating) {
      console.log("creating event")
      this.eventService.createEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;
        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]); //this will go to the page about the event
      });
    } else {
      console.log("updating event");

      this.eventService.updateEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;

        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]); //this will go to the page about the event
      });
    }
  }
}
