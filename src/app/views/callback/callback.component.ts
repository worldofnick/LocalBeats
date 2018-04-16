import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SpotifyClientService } from '../../services/music/spotify-client.service';
import { UserService } from '../../services/auth/user.service';
import { SharedDataService } from '../../services/shared/shared-data.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';
import { User } from '../../models/user';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  spotifyCode: string;
  localAuthToken: string;

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar,
              private userService: UserService, private router: Router,
              private sharedDataService: SharedDataService,
              private _spotifyClientService: SpotifyClientService) { }

  ngOnInit() {
    const callbackUrl = window.location.href;
    console.log('>> URL: ' + callbackUrl);

    if (callbackUrl.indexOf('spotify') >= 0) {
      this.spotifyCode = this.extractSpotifyCode();
      this.getTokensProfileAndAlbums();
    } else if (callbackUrl.indexOf('?localAccessAuth=') >= 0) {
      this.localAuthToken = this.extractAuthCode();
      this.verifyLocalAccessJwtAndRedirect();
    }
  }

  /**
   * Gets the spotify tokens, then profile data, then albums and
   * saves it to the logged in user object.
   */
  getTokensProfileAndAlbums() {
    // console.log('>> IN GET TOKENS');
    this._spotifyClientService.requestRefreshAndAccessTokens(this.spotifyCode).then((tokens: any) => {
      // console.log('Callback token data: ', tokens);
      return tokens;
    }).then( (tokens: any) => {
      if (tokens !== false) {
        this.getSpotifyProfileDataOfMe(tokens);
      } else {
        let snackBarRef = this.snackBar.open('Unable to link account. So please try again later.', '', {
          duration: 6000,
        });
        this.router.navigate(['/profile']);
      }
    });
  }

  /**
   * Get the spotify profile data of this user
   * @param tokens access_token, refresh_token, expires_in
   */
  getSpotifyProfileDataOfMe(tokens: any) {
    // console.log('>> IN PROFILE DATA');
    // console.log('Next promise\'s token data received: ', tokens);
    this._spotifyClientService.requestSpotifyMyProfile(tokens).then((responseWithUserPayload: any) => {
      // console.log('My spotify profile: ', responseWithUserPayload);
      return responseWithUserPayload;
    }).then((responseWithUserPayload: any) => {
      if (responseWithUserPayload !== false) {
        this.getAlbumsOfMe(responseWithUserPayload);
      } else {
        let snackBarRef = this.snackBar.open('Unable to link account. So please try again later.', '', {
          duration: 6000,
        });
        this.router.navigate(['/profile']);
      }
    });
  }

  /**
   * Get all the albums/singles owned/created by me in US market
   * @param responseWithUserPayload contains user object with spotify id, tokens
   */
  getAlbumsOfMe(responseWithUserPayload: any) {
    // console.log('>> IN GTE ALBUMS');
    // console.log('Getting the albums of ' + responseWithUserPayload.user.spotify.email);
    this._spotifyClientService.requestAlbumsOwnedByAnArtist(responseWithUserPayload.user)
      .then( (listOfSpotifyAlbumObjects: any) => {
        if ( listOfSpotifyAlbumObjects !== false ) {
          this.saveToUserAndRedirect(responseWithUserPayload, listOfSpotifyAlbumObjects);
        } else {
          let snackBarRef = this.snackBar.open('You are not registered as an artist on spotify...', '', {
            duration: 6000,
          });
          this.router.navigate(['/profile']);
        }
      })
      .catch( (error: any) => {
        console.log(error);
      });
  }

  /**
   * Saves the spotify profile and the list of albums in user object
   * @param responseWithUserPayload contains the spotify profile data
   * @param listOfSpotifyAlbumObjects contains the list of albums
   */
  saveToUserAndRedirect(responseWithUserPayload: any, listOfSpotifyAlbumObjects: any) {
      // console.log('List of albums: ', listOfSpotifyAlbumObjects);
      // console.log('>> IN SAVE USER');
      const spotifyObject = {
        email: responseWithUserPayload.user.spotify.email,
        id: responseWithUserPayload.user.spotify.id,
        uri: responseWithUserPayload.user.spotify.uri,
        href: responseWithUserPayload.user.spotify.href,
        accessToken: responseWithUserPayload.user.spotify.accessToken,
        refreshToken: responseWithUserPayload.user.spotify.refreshToken,
        albums: listOfSpotifyAlbumObjects.albums.items
      };

      // Save the spotify profile and the albums to user service object
      let newUser = this.userService.user;
      newUser.spotify = spotifyObject;
      // console.log('Spotify Object to save: ', newUser);
      this.userService.user = newUser;
      this.userService.onEditProfile(this.userService.user).then((user: User) => {
        // Redirect to the profile page to setup and display the spotify widget
        this.router.navigate(['/profile']);
        // let snackBarRef = this.snackBar.open('Spotify linking successful 🎉',
        //     'Go to Music Corner...', { duration: 3500 });
        let snackBarRef = this.snackBar.open('Spotify linking successful 🎉', '', { duration: 3500 });

      //   snackBarRef.onAction().subscribe(() => {
      //     // console.log('Going to the music corner...');
      //     this.router.navigate(['/profile']);
      // });
      });
  }

  /**
   * Extracts and returns the spotify temp code from the URL after
   *  authentication callback from the spotify website
   */
  extractSpotifyCode(): string {
    const callbackURL = window.location.href;
    // console.log('URL: ', callbackURL);
    if (callbackURL.indexOf('spotify') >= 0 ) {
      const typeIndex = callbackURL.indexOf('spotify');
      // console.log('Index: ', typeIndex);
      if(callbackURL.indexOf('?code=') >= 0 ) {
        const codeStartIndex = callbackURL.indexOf('?code=');
        const code = callbackURL.substr(codeStartIndex+6);
        // console.log("Code: ", code);
        return code;
      } else if (callbackURL.indexOf('?error=') >= 0 ) {
        this.router.navigate(['/profile']);
        return '';
      }
    }
  }

  extractAuthCode(): string {
    const callbackUrl = window.location.href;
    if ( callbackUrl.indexOf('?localAccessAuth=') >= 0 ) {
      const codeStartIndex = callbackUrl.indexOf('?localAccessAuth=');
      const code = callbackUrl.substr(codeStartIndex + 17);
      console.log('Code: ', code);
      return code;
    }
    return '';
  }

  // TODO: complete it
  verifyLocalAccessJwtAndRedirect() {
    // TODO: contact server and log in and redirect
    this.userService.verifyLocalAccessToken(this.localAuthToken).subscribe(
      (data: any) => {
        console.log('>> Data received: ', data);
        this.userService.userLoaded(data.user, data.token, false, false);
        this.userService.getNotificationsCountForUser(data.user._id);
        this.userService.getNotificationsForUser(data.user._id);
        this.sharedDataService.setOverallChatUnreadCount(data.user as User);
        this.router.navigate(['/']);
      },
      (error: any) => {
        console.log('>> Error: ', error);
        this.router.navigate(['/auth']);
        this.snackBar.open(error, '', {
          duration: 7000,
        });
      });
  }
}
