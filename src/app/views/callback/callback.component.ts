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
