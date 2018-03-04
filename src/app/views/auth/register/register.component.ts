import { Component, OnInit, EventEmitter, Input, Output, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  @ViewChild("searchplaces") searchElementRef: ElementRef;

  // Google Places
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zoom: number;

  signupForm: FormGroup;
  user: User;
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];

  constructor(
    private userService: UserService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.signupForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: password,
      confirmPassword: confirmPassword,
      genres: new FormControl(),
      events: new FormControl(), 
      isArtist: new FormControl(false),
      location: new FormControl()
    })

    // Set Current Location if desired in future
    this.setCurrentPosition();

    // Load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.signupForm.setControl('location', new FormControl(place.formatted_address))
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.city = place.address_components[0].long_name
          this.state = place.address_components[2].short_name
          this.zoom = 12;
        });
      });
    });
  }

  // Helper method for Google Places
  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  signup() {

    const signupData = this.signupForm.value;
    this.user = {
      _id: null,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      password: signupData.password,
      spotify: null,
      soundcloud: null,
      genres: signupData.genres,
      isArtist: signupData.isArtist,
      profilePicUrl: "https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png",
      eventTypes: signupData.events,
      socket: null,
      city: '',
      state: '',
      location: null,
      isOnline: true,
      stripeAccountId: null
    };

    if (this.longitude != null && this.signupForm.get('location').value != '') {
      this.user.location = [this.longitude, this.latitude];
      this.user.city = this.city;
      this.user.state = this.state;
    } 

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    this.userService.signupUser(this.user).then((user: User) => {
      this.user = user;
      this.router.navigate(['/']);
    });
  }

}

