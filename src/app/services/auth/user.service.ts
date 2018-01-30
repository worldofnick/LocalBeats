// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocketService } from '../../services/chats/socket.service';
import { Message } from '../../services/chats/model/message';
import { Event } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';

// For Angular 5 HttpClient Module
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UserService {
    public connection: string = 'http://localhost:8080/api/auth';
    public userConnection: string = 'http://localhost:8080/api/users';
    // public connection: string = 'https://localbeats.herokuapp.com/api/auth';
    // public userConnection: string = 'https://localbeats.herokuapp.com/api/users';
    // public getUserConnection: string = 'https://localbeats.herokuapp.com/api/user';
    public accessToken: string = null;
    public user: User = null;
    ioConnection: any;
    action = Action;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http, private _socketService: SocketService, private _httpClient: HttpClient) { this.initIoConnection(); }

    private initIoConnection(): void {
        this._socketService.initSocket();
    
        // TODO: can remove
        this.ioConnection = this._socketService.onEvent(Event.NEW_LOG_IN)
          .subscribe((message: Message) => {
            // this.messages.push(message);
            console.log('Server Msg to auth.component ', message);
        });
      }

    // post("api/auth/passwordChange/:uid')
    public signupUser(newUser: User): Promise<User> {
        const current = this.connection + '/register';
        console.log(newUser)
        return this.http.post(current, newUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;

                // Notify server that a new user user logged in
                this._socketService.send(Action.NEW_LOG_IN, {
                    from: this.user,
                    action: Action.NEW_LOG_IN
                });

                return this.user;
            })
            .catch(this.handleError);
    }

    // post("/api/users/uid")
    public onEditProfile(newUser: User): Promise<User> {
        const current = this.userConnection + '/' + newUser._id;
        return this.http.put(current, { user: newUser }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.user = data.user as User;
                return this.user
            })
            .catch(this.handleError);
    }

    // post("/api/authenticate")
    public signinUser(returningUser: User): Promise<User> {
        // this.connection = 'http://localhost:8080/api/auth/authenticate';
        const current = this.connection + '/authenticate';
        // console.log('Returning User in auth: ', returningUser);
        return this.http.post(current, returningUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;

                // Notify server that a new user user logged in
                this._socketService.send(Action.NEW_LOG_IN, {
                    from: this.user,
                    action: Action.NEW_LOG_IN
                });

                return this.user;
            })
            .catch(this.handleError);
    }


    /**
     * 
     * @param user 
     * change password
     * /api/auth/passwordChange/:uid')
     */
    // /api/auth/passwordChange/:uid')
    public updatePassword(user: User): Promise<User> {
        const current = this.connection + '/passwordChange/' + user._id;
        let newPassword: string = user.password;
        return this.http.put(current, {'newPassword': newPassword}, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;
                return this.user;
            })
            .catch(this.handleError);
    }

    // get user
    ///api/users/:uid
    /**
     * 
     * @param userToGet 
     * 
     * 
     */
    public getUserByID(ID: String): Promise<User> {
        const current = this.userConnection + '/' + ID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // console.log(this.accessToken)
                let temp = data.user as User;
                return temp
            })
            .catch(this.handleError);
    }

    public logout() {
        let from: User = this.user;
        const current = this.connection + '/logout';
        console.log('LOGOUT USER: ', this.user);
        return this.http.post(current, this.user, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {

                this.accessToken = null;
                this.user = null;
                sessionStorage.clear();

                // Notify server that a new user user logged in
                this._socketService.send(Action.SMN_LOGGED_OUT, {
                    from: from,
                    action: Action.SMN_LOGGED_OUT
                });
            })
            .catch(this.handleError);
    }

    public isAuthenticated() {
        return this.accessToken != null;
    }

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}