import { Component, OnInit, EventEmitter, Input, Output, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { SearchService } from '../../../services/search/search.service';
import { AuthService, GoogleLoginProvider } from 'angular5-social-login';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  @ViewChild("searchplaces") searchElementRef: ElementRef;
  error: boolean = false;
  errorMessage: string = '';
  isMagicLinkBeingSent: boolean = true;
  wasMagicLinkSuccessfullySent: boolean = false;

  // Google Places
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zoom: number;

  signupForm: FormGroup;
  preferencesFormGroup: FormGroup;
  thirdPartyAccountFormGroup: FormGroup;

  user: User;
  socialGooglePayload: any;
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];

  constructor(
    private userService: UserService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private socialAuthService: AuthService,
    private changeDetector: ChangeDetectorRef,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.searchService.eventTypes().then((types: string[]) => {
      this.eventsList = types;
    }).then(() => this.searchService.genres().then((types: string[]) => {
      this.genresList = types;
    }));
    // TODO: remove second group's properties
    this.signupForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      location: new FormControl('', Validators.required)
    });

    this.preferencesFormGroup = new FormGroup({
      genres: new FormControl(),
      events: new FormControl(),
      isArtist: new FormControl(false),
    });

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
          this.signupForm.setControl('location', new FormControl(place.formatted_address));
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

  public socialSignUp(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log(socialPlatform + 'sign in data : ', userData);

        // Verify the token and get payload
        this.userService.verifyGoogleSocialIdToken(userData.idToken).subscribe(
          (payload: any) => {
            this.socialGooglePayload = payload;
            // If success, auto-fill details
            this.signupForm.setValue(
              {
                firstName: payload.response.given_name,
                lastName: payload.response.family_name,
                email: payload.response.email,
                location: null
              });
          },
          (error: any) => {
            console.error(error);
            this.errorHandler(error);
          });
      });
  }

  signup() {

    const signupData = this.signupForm.value;
    const preferencesData = this.preferencesFormGroup.value;

    this.user = {
      _id: null,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      fullName: signupData.firstName + ' ' + signupData.lastName,
      email: signupData.email,
      password: null,
      spotify: null,
      soundcloud: null,
      genres: preferencesData.genres,
      isArtist: preferencesData.isArtist,
      profilePicUrl: 'https://www.vccircle.com/wp-content/uploads/2017/03/default-profile.png',
      eventTypes: preferencesData.events,
      socket: null,
      city: '',
      averageRating: 0,
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

    console.log('>> User object: ', this.user);

    // Add the user to DB, and if successful, send a magic link to email
    this.userService.signupUser(this.user).subscribe(
      (data: any) => {
        // Correctly authenticated, redirect
        this.error = false;
        this.isMagicLinkBeingSent = true;
        this.wasMagicLinkSuccessfullySent = false;

        this.userService.requestMagicLink(this.user).subscribe(
          (responseData: any) => {
            // Magic link successfully sent!
            this.error = false;
            this.isMagicLinkBeingSent = false;
            this.wasMagicLinkSuccessfullySent = true;
            this.progressBar.mode = 'determinate';
          },
          (error) => {
            this.errorHandler(error);
          });
      },
      (error) => {
        this.errorHandler(error);
      }
    );
  }

  private errorHandler(error: any) {
    // Show user error message
    this.errorMessage = error;
    this.error = true;
    this.isMagicLinkBeingSent = false;
    this.wasMagicLinkSuccessfullySent = false;
    this.progressBar.mode = 'determinate';
  }
}

