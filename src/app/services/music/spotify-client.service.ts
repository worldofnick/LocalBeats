import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../../services/chats/socket.service';
import { UserService } from '../../services/auth/user.service';
import { SocketEvent } from '../../services/chats/model/event';
import { environment } from '../../../environments/environment';
import { User } from 'app/models/user';

@Injectable()
export class SpotifyClientService {

  public authorizeConnection: string = environment.apiURL + 'api/spotify'; 
  private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: Http, private _socketService: SocketService, private _userService: UserService) { }

  // Redirect user to stripe website
  public authorizeSpotify(): Promise<string> {
    const current = this.authorizeConnection + '/authorize';
    console.log('Spotify AUth server url: ', current);
    return this.http.post(current, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          console.log('Data SPotift: ', data);
          return data.redirect_url;
        })
        .catch(this.handleError);
  }

  public requestRefreshAndAccessTokens(code: string): Promise<any> {

    const current = this.authorizeConnection + '/getAuthTokens';
    console.log('Spotify Token server url: ', current);
    return this.http.post(current, {user: this._userService.user, code: code}, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          console.log('Tokens recieved: ', data);
          return data;
        })
        .catch(this.handleError);

    // const current = 'https://accounts.spotify.com/api/token';
    // let parameters = {
    //   grant_type: 'authorization_code',
    //   code: code,
    //   redirect_uri: environment.apiURL + 'callback/spotify', //TODO: change to heroku, etc
    //   json: true
    // };
    // let newHeaders:Headers = new Headers({
    //   'Content-Type': 'application/json',
    //   'client_id': '9b266aeaa5904de699d2864591f4e248',
    //   'client_secret': 'ced120445fe74bdca660090161898476'
    // });
    // console.log('Spotify Token Request url: ', current);
    // return this.http.post(current, {} , { headers: this.headers })
    //     .toPromise()
    //     .then((response: Response) => {
    //       const data = response.json();
    //       console.log('Tokens Data (Spotify): ', data);
    //       return data;
    //     })
    //     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console
    return Promise.reject(errMsg);
}
}
