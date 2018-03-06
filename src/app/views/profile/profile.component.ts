import { Component, OnDestroy, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../services/auth/user.service';
import { BookingService } from '../../services/booking/booking.service';
import { NotificationService } from '../../services/notification/notification.service';
import { EventService } from '../../services/event/event.service';
import { SocketService } from '../../services/chats/socket.service';
import { SharedDataService } from '../../services/shared/shared-data.service';
import { Action } from '../../services/chats/model/action';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { User } from '../../models/user';
import { Booking } from '../../models/booking';
import { Event } from '../../models/event';
import { Notification } from '../../models/notification';
import { Router } from '@angular/router';
import { SpotifyClientService } from '../../services/music/spotify-client.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {MatListModule} from '@angular/material/list';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewChecked {
  activeView: string = 'overview';
  user: User = new User; //changed this from null to new User
  onOwnProfile: boolean = null;
  userID: any = null;
  requested: boolean = null;
  clickedRequestArtist:boolean = null;
  clickedOverview = false;

  events:any[];
  requestedArtistEvents: any[] = [];
  requestedArtistBookings: any[] = [];
  appliedEvents: Event[] = [];
  appliedBookings: any[] = [];
  deleteStatus:Number;
  hasApplied:Boolean = true;

  // Spotify and Soundcloud
  onSpotifyWidget = false;
  trustedAlbumUrl: SafeResourceUrl;
  trustedSoundcloudUrl: SafeResourceUrl;
  soundcloudIdFormInput: string;

  constructor(private route: ActivatedRoute,
    private router : Router,
    public userService: UserService,
    private bookingService: BookingService,
    private eventService: EventService, public snackBar: MatSnackBar,
    private notificationService: NotificationService, private cdRef:ChangeDetectorRef,
    private sanitizer: DomSanitizer, private _sharedDataService: SharedDataService,
    private _socketService: SocketService, private _spotifyClientService: SpotifyClientService) {

     router.events.subscribe((url: any) => this.clickedOverview = router.url == "/profile/overview");

  }

  

  hasRequested() {
    if(!this.userService.isAuthenticated()){
      return;
    }
    this.bookingService.getUserBookings(this.userService.user, 'host').then((bookings: any[]) => {
      for (let result of bookings) {
        if (result.booking && result.booking.performerUser._id == this.user._id && !this.onOwnProfile) {
          this.requested = true;
        } else {
          this.requested = false;
        }
      }
    });
  }

  ngAfterViewChecked(): void {
		this.cdRef.detectChanges();
	}

  ngOnDestroy() {
    this.cdRef.detach(); // try this
    // for me I was detect changes inside "subscribe" so was enough for me to just unsubscribe;
    // this.authObserver.unsubscribe();
  }

  ngOnInit() {
    this.user = this.userService.user;
    this.activeView = this.route.snapshot.params['view'];
    

    //snapshot params returns a javascript object. index into it with the property field to get a property.
    this.userID = {
      id: this.route.snapshot.params['id']
    }

    if (this.userID["id"] == null) {
      this.onOwnProfile = true;
      //this.user = this.userService.user;
      // Retreive and store the latest spotify albums of this user
      this.getSpotifyAlbumsAndSave();
    } else {
      //on another perons profile.
      this.onOwnProfile = false;
      let ID: String = this.userID["id"];

      this.userService.getUserByID(ID).then((gottenUser: User) => {
        this.user = gottenUser;
        // console.log('Profile got user: ', gottenUser);
        // Retreive and store the latest spotify albums of this user
        this.getSpotifyAlbumsAndSave();
      }).then(() => this.hasRequested());
    }

    //received socket emition from server about updating profile 
    this._socketService.onEvent(SocketEvent.UPDATE_PROFILE).subscribe((user: User)=>{
      this.user = user;
    });

    // console.log('User object: ', this.user);
  }

  clickedOver() {
    this.clickedOverview = true;
  }

  /**
   * Handler for when message button on profile page is clicked
   */
  onStartNewConversationFromProfileButtonClick() {
    // If the user clicked message to some other user, then initiate conversation with it
    if (!this.onOwnProfile) {
      this._sharedDataService.setProfileMessageSharedProperties(this.user);
      this.router.navigate(['/chat']);
    }
  }

  // ========================================
  // Music corner methods
  // ========================================

  /**
   * Redirects user to spotify website to login and
   *  ask for permissions
   */
  public authorizeSpotify() {
    this._spotifyClientService.authorizeSpotify().then((url: string) => {
      window.location.href = url;
      // window.open(url);
    });
  }

  /**
   * Returns a sanitized version of the passed url
   */
  getSanitizedUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Detects which music corner tab is selected and loads
   *  content accordingly
   * @param event Contains the selected tab index
   */
  onMusicTabSelectChange(event) {
    if (event.index === 0) {
      // console.log('Spotify tab is selected!');
    } else {
      // console.log('Soundcloud tab is selected!');
      if (this.user.soundcloud !== undefined && this.user.soundcloud !== null) {
        this.sanitizeSoundcloudUrl();
      }
    }
  }

  /**
   * Gets the latest albums of this user on the profile page and
   *  set it to the user object's albums property
   */
  getSpotifyAlbumsAndSave() {
    // console.log('Profile user: ', this.user);
    // console.log(this.user.spotify !== null && this.user.spotify !== undefined);
    if ( this.user !== null && this.user !== undefined ) {
      if (this.user.spotify !== null && this.user.spotify !== undefined) {
        this._spotifyClientService.requestAlbumsOwnedByAnArtist(this.user)
          .then((listOfSpotifyAlbumObjects: any) => {
            this.user.spotify.albums = listOfSpotifyAlbumObjects.albums.items;
            console.log('Saved albums: ', this.user);
          });
      }
    }
  }

  /**
   * Triggered when one of the spotify album rows
   *  is clicked
   * @param album The spotify album object that was clicked
   */
  public onAlbumRowClicked(album) {
    // console.log('Album ', album, 'clicked' );
    this.onSpotifyWidget = true;

    let dangerousAlbumUrl = 'https://open.spotify.com/embed?uri=spotify%3Aalbum%3A' + album.id + '&theme=white';
    this.trustedAlbumUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dangerousAlbumUrl);
  }

  /**
   * Triggered when bacl t albums button on spotify
   *  card is clicked
   */
  public backToSpotifyAlbumsClicked() {
    this.onSpotifyWidget = false;
    this.trustedAlbumUrl = undefined;
  }

  /**
   * Saves the soundcloud id to DB if it is valid
   *  and sanitizes the url to use in iframe
   * @param event Contains the keypress
   */
  registerSoundcloudClicked(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      console.log('Entered soundcloud id: %s', this.soundcloudIdFormInput);

      // If the user entered non-blank id and hit send, communicate with server
      if (this.soundcloudIdFormInput.trim().length > 0) {
        // Get user profile data from the server which contacts soundcloud API
        this._spotifyClientService.getSoundcloudProfileData(this.soundcloudIdFormInput).then((updatedUser: any) => {
          if (updatedUser !== false) {
            this.user.soundcloud = {
              id: updatedUser.soundcloud.id,
              avatar_url: updatedUser.soundcloud.avatar_url,
              username: updatedUser.soundcloud.username
            };
            console.log('This User: ', this.user);
            this.userService.user = this.user;
            this.sanitizeSoundcloudUrl();
          } else {
            // Invalid soundcloud username. Notify user and keep the input
            let snackBarRef = this.snackBar.open('Invalid Soundcloud username. Try Again!', '', {
              duration: 3000,
            });
          }
        });

        // TODO: Save the soundcloud id to the DB
        // this.user.soundcloud = { username: this.soundcloudIdFormInput };
        // this.userService.onEditProfile(this.user).then( (userWithSoundcloud: User) => {
        //   this.sanitizeSoundcloudUrl();
        // });
      }

      this.soundcloudIdFormInput = '';
    }
  }

  /**
   * Creates the iframe url, and sets the sanitized version of it
   */
  public sanitizeSoundcloudUrl() {
    const dangerousAlbumUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' +
    this.user.soundcloud.id + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&' +
    'show_user=true&show_reposts=false&show_teaser=true&visual=true';
    this.trustedSoundcloudUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dangerousAlbumUrl);
  }
  
  // ======================================
  // Social Accounts Tab Methods
  // ======================================

  unlinkSpotify() {
    this.user.spotify = undefined;
    this.userService.user = this.user;
    this._spotifyClientService.removeSpotifyFromUser(this.user).then((unlinkedUser: User) => {
      // this.user = unlinkedUser;
      this.userService.user = this.user;
      let snackBarRef = this.snackBar.open('Spotify Account Unlinked', '', {
        duration: 1500,
      });
    });
  }

  unlinkSoundcloud() {
    this.user.soundcloud = undefined;
    this.userService.user = this.user;
    this._spotifyClientService.removeSoundcloudFromUser(this.user).then((unlinkedUser: User) => {
      // this.user = unlinkedUser;
      this.userService.user = this.user;
      let snackBarRef = this.snackBar.open('Soundcloud Account Unlinked', '', {
        duration: 1500,
      });
    });
  }
}
