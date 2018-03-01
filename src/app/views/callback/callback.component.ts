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
    this.getTokens();
  }

  getTokens() {
    this._spotifyClientService.requestRefreshAndAccessTokens(this.spotifyCode).then((tokens: any) => {
      console.log('Callback token data: ', tokens);
      return tokens;
    }).then( (tokens: any) => {
      console.log('Next promise\'s token data received: ', tokens);

      // Get the spotify profile data of this user
      this._spotifyClientService.requestSpotifyMyProfile(tokens).then((responseWithUserPayload: any) => {
        console.log('My spotify profile: ', responseWithUserPayload);
        return responseWithUserPayload;
      }).then( (responseWithUserPayload: any) => this.getAlbums(responseWithUserPayload) );
      // TODO: 
      // 1. request the profile data here. Will get the tokens and the user object
      // 1.1 Get the albums of this user (uri, name, id, href, release_date)
      // 2. save the user object to this._userService.user
      // 3. Redirect

      // 4. Then in profile/ code, since user now has spotify.id, can request playlist and load the widget
    });
  }

  getProfile(tokens: any) {

  }

  getAlbums(responseWithUserPayload: any) {
    console.log('Getting the albums of ' + responseWithUserPayload.user.spotify.email);
    this._spotifyClientService.requestAlbumsOwnedByAnArtist(responseWithUserPayload.user)
      .then( (listOfSpotifyAlbumObjects: any) => this.saveToUserAndRedirect(responseWithUserPayload,
                                                                      listOfSpotifyAlbumObjects) );
  }

  saveToUserAndRedirect(responseWithUserPayload: any, listOfSpotifyAlbumObjects: any) {
      console.log('List of albums: ', listOfSpotifyAlbumObjects);

      const spotifyObject = {
        email: responseWithUserPayload.user.spotify.email,
        id: responseWithUserPayload.user.spotify.id,
        uri: responseWithUserPayload.user.spotify.uri,
        href: responseWithUserPayload.user.spotify.href,
        albums: listOfSpotifyAlbumObjects.albums.items
      };
      console.log('Spotify Object to save: ', spotifyObject);
      // Save the spotify profile and the albums to user service object
      this.userService.user.spotify = spotifyObject;
      // Redirect to the profile page to setup and display the spotify widget
      this.router.navigate(['/profile', 'overview']);
  }

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
