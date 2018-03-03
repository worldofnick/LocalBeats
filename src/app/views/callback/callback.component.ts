import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SpotifyClientService } from '../../services/music/spotify-client.service';
import { UserService } from '../../services/auth/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  spotifyCode: string;

  constructor(private route: ActivatedRoute, private userService: UserService, private router : Router,
              private _spotifyClientService: SpotifyClientService) { }

  ngOnInit() {
    this.spotifyCode = this.extractSpotifyCode();
    this.getTokensProfileAndAlbums();
  }

  /**
   * Gets the spotify tokens, then profile data, then albums and
   * saves it to the logged in user object.
   */
  getTokensProfileAndAlbums() {
    this._spotifyClientService.requestRefreshAndAccessTokens(this.spotifyCode).then((tokens: any) => {
      console.log('Callback token data: ', tokens);
      return tokens;
    }).then( (tokens: any) => this.getSpotifyProfileDataOfMe(tokens));
  }

  /**
   * Get the spotify profile data of this user
   * @param tokens access_token, refresh_token, expires_in
   */
  getSpotifyProfileDataOfMe(tokens: any) {
    console.log('Next promise\'s token data received: ', tokens);
    this._spotifyClientService.requestSpotifyMyProfile(tokens).then((responseWithUserPayload: any) => {
      console.log('My spotify profile: ', responseWithUserPayload);
      return responseWithUserPayload;
    }).then((responseWithUserPayload: any) => this.getAlbumsOfMe(responseWithUserPayload));
  }

  /**
   * Get all the albums/singles owned/created by me in US market
   * @param responseWithUserPayload contains user object with spotify id, tokens
   */
  getAlbumsOfMe(responseWithUserPayload: any) {
    console.log('Getting the albums of ' + responseWithUserPayload.user.spotify.email);
    this._spotifyClientService.requestAlbumsOwnedByAnArtist(responseWithUserPayload.user)
      .then( (listOfSpotifyAlbumObjects: any) => this.saveToUserAndRedirect(responseWithUserPayload,
                                                                      listOfSpotifyAlbumObjects) );
  }

  /**
   * Saves the spotify profile and the list of albums in user object
   * @param responseWithUserPayload contains the spotify profile data
   * @param listOfSpotifyAlbumObjects contains the list of albums
   */
  saveToUserAndRedirect(responseWithUserPayload: any, listOfSpotifyAlbumObjects: any) {
      console.log('List of albums: ', listOfSpotifyAlbumObjects);

      const spotifyObject = {
        email: responseWithUserPayload.user.spotify.email,
        id: responseWithUserPayload.user.spotify.id,
        uri: responseWithUserPayload.user.spotify.uri,
        href: responseWithUserPayload.user.spotify.href,
        accessToken: responseWithUserPayload.user.spotify.accessToken,
        refreshToken: responseWithUserPayload.user.spotify.refreshToken,
        albums: listOfSpotifyAlbumObjects.albums.items
      };
      console.log('Spotify Object to save: ', spotifyObject);
      // Save the spotify profile and the albums to user service object
      let newUser = this.userService.user;
      newUser.spotify = spotifyObject;
      this.userService.setUser(newUser);
      // Redirect to the profile page to setup and display the spotify widget
      this.router.navigate(['/profile', 'overview']);
  }

  /**
   * Extracts and returns the spotify temp code from the URL after
   *  authentication callback from the spotify website
   */
  extractSpotifyCode(): string {
    const callbackURL = window.location.href;
    console.log('URL: ', callbackURL);
    if (callbackURL.indexOf('spotify') >= 0 ) {
      const typeIndex = callbackURL.indexOf('spotify');
      console.log('Index: ', typeIndex);
      if(callbackURL.indexOf('?code=') >= 0 ) {
        const codeStartIndex = callbackURL.indexOf('?code=');
        const code = callbackURL.substr(codeStartIndex+6);
        console.log("Code: ", code);
        return code;
      } else if (callbackURL.indexOf('?error=') >= 0 ) {
        //TODO: no code, handle error (or just redirect to the profile/setting)
        this.router.navigate(['/profile', 'settings']);
        return '';
      }
    }
  }
}
