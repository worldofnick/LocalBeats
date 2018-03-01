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
    this._spotifyClientService.requestRefreshAndAccessTokens(this.spotifyCode).then((data: any) => {
      console.log('Callback token data: ', data);
      return data;
    }).then( (data: any) => {
      console.log('Next then promise token data: ', data);

      // TODO: 
      // 1. request the profile data here. Will get the tokens and the user object
      // 2. save the user object to this._userService.user
      // 3. Redirect

      // 4. Then in profile/ code, since user now has spotify.id, can request playlist and load the widget

      
      // this.router.navigate(['/profile', 'settings']);  //TODO: change to profile/settings after persistent sign in
      
      //TODO: save it to localStorage
      // TODO: Chnage proifle button to linked (check)

    });
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
