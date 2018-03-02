// 'use strict';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification'
import { SocketService } from '../../services/chats/socket.service';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelper } from 'angular2-jwt';

// For Angular 5 HttpClient Module
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UserService {
    // Request properties
    public connection: string = environment.apiURL + 'api/auth';
    public userConnection: string = environment.apiURL + 'api/users';
    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    // Socket properties
    ioConnection: any;
    action = Action;

    // ================================================
    // Session Persistence
    // ================================================

    // Authentication Persistence Properties
    jwtHelper: JwtHelper = new JwtHelper();
    loggedIn: boolean;
    loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
    public user: User = null;

    /**
     * Checks the user session and sets/deletes it.
     * Initializes the socket event listeners.
     * @param http To be deprecated
     * @param _socketService
     * @param _httpClient Angular 5
     */
    constructor(private http: Http, private _socketService: SocketService, private _httpClient: HttpClient) {

        // If authenticated, set local user property and update login status subject
        // If token is expired, log out to clear any data from localStorage
        if (this.isAuthenticated()) {
            this.user = JSON.parse(localStorage.getItem('loggedInUser'));
            this.setLoggedIn(true);
            this.notifyNewUserLoginToServer(this.user);

            // TODO: @Adam Should make new socket events calls for faster performance!!!
            this.getNotificationsCountForUser(this.user._id);
            this.getNotificationsForUser(this.user._id);
        } else {
            this.logout();
        }
        this.initIoConnection();    // Initial socket event listeners
    }

    public setUser(newUser: User) {
        localStorage.setItem('loggedInUser', JSON.stringify(newUser));
        // Acts as a validation sanity check
        this.user = JSON.parse(localStorage.getItem('loggedInUser'));
    }

    /**
     * Set the token, user in local storage,
     * sets the logged in status to true, and
     * notifies the server that a user has logged in
     */
    private _setSession(jwtAccessToken, user) {
        if (jwtAccessToken !== null || jwtAccessToken !== undefined) {
            console.log('JWT Access Token: ', jwtAccessToken);
            localStorage.setItem('jwtToken', jwtAccessToken);
        }

        console.log('Logged in user: ', user);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        this.user = user;
        this.setLoggedIn(true);

        this.notifyNewUserLoginToServer(user);
    }

    /**
     * Update login status subject and variable
     * @param value true or false (logged in or not)
     */
    setLoggedIn(value: boolean) {
        this.loggedIn$.next(value);     // Update login status subject
        this.loggedIn = value;
    }

    /**
     * Returns if the user's session is still valid based on the
     *  JWT expiration date (usually 1 whole day from the time of issue)
     */
    public isAuthenticated(): boolean {
        if (localStorage.getItem('jwtToken')) {
            return !this.jwtHelper.isTokenExpired(localStorage.getItem('jwtToken'));
        } else {
            return false;
        }
    }

    /**
     * Checks and returns true if this user is
     *  authenticated AND the object is done loading
     */
    public iAmDoneLoading(): boolean {
        return (this.isAuthenticated() && this.user) ? true : false;
    }

    /**
     * Notifies the server that this user is loggin out and
     *  removes all the localStorage data, resets parameters
     */
    public logout() {
        if (this.user) {
            this.notifyUserLoggedOutToServer(this.user);
        }
        // Remove tokens and profile and update login status subject
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUser');
        this.user = null;
        this.setLoggedIn(false);
    }

    // ===============================================
    // User REST services
    // ===============================================

    public signupUser(newUser: User): Promise<User> {
        const current = this.connection + '/register';
        console.log('Sign Up service received: ', newUser);
        return this.http.post(current, newUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this._setSession(data.token, (data.user as User));
                this.notifyServerToAddGreetBot(this.user);
                return (data.user as User);
            })
            .catch(this.handleError);
    }

    public onEditProfile(newUser: User): Promise<User> {
        const current = this.userConnection + '/' + newUser._id;
        return this.http.put(current, { user: newUser }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this._setSession(undefined, (data.user as User));
                return (data.user as User);
            })
            .catch(this.handleError);
    }

    public signinUser(returningUser: User): Promise<User> {
        const current = this.connection + '/authenticate';
        return this.http.post(current, returningUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this._setSession(data.token, (data.user as User));
                return (data.user as User);
            })
            .catch(this.handleError);
    }

    public updatePassword(user: User): Promise<User> {
        const current = this.connection + '/passwordChange/' + user._id;
        let newPassword: string = user.password;
        return this.http.put(current, { 'newPassword': newPassword }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this._setSession(undefined, (data.user as User));
                return (data.user as User);
            })
            .catch(this.handleError);
    }

    public getUserByID(ID: String): Promise<User> {
        const current = this.userConnection + '/' + ID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                console.log('Got user from server: ', data.user);
                this._setSession(undefined, (data.user as User));
                return data.user as User;
            })
            .catch(this.handleError);
    }

    // ====================================
    // Socket events methods
    // ====================================

    /**
     * Initiates an event socket coming from the server side
     */
    private initIoConnection(): void {
        this.ioConnection = this._socketService.onEvent(SocketEvent.NEW_LOG_IN)
            .subscribe((message: Message) => {
                // this.messages.push(message);
                console.log('Server Msg to auth.component ', message);
            });
    }

    /**
     * Emits an event notifying the server that a user
     *  has logged in
     */
    private notifyNewUserLoginToServer(user) {
        // Notify server that a new user user logged in
        this._socketService.send(Action.NEW_LOG_IN, {
            from: user,
            action: Action.NEW_LOG_IN
        });
    }

    /**
     * Emits an event notifying the server that a user
     *  has logged out
     */
    private notifyUserLoggedOutToServer(user) {
        // Notify server that a new user user logged in
        this._socketService.send(Action.SMN_LOGGED_OUT, {
            from: user,
            action: Action.SMN_LOGGED_OUT
        });
    }

    /**
     * Emits an event notifying the server that to
     *  add the greet bot
     */
    private notifyServerToAddGreetBot(to: User) {
        this._socketService.send(Action.GREET_WITH_BEATBOT, {
            to: this.user,
            action: Action.GREET_WITH_BEATBOT
        });
    }

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }

    // =====================================
    // Other methods (DO NOT TOUCH)
    // =====================================

    private openDialog = function (uri, name, options, cb) {
        var win = window.open(uri, name, options);
        var interval = window.setInterval(function () {
            try {
                if (!win || win.closed) {
                    window.clearInterval(interval);
                    cb(win);
                }
            }
            catch (e) { }
        }, 1000000);
        return win;
    };

    private toQueryString = function (obj) {
        var parts = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }
        };
        return parts.join('&');
    };

    // ===========================================
    // Notification Methods
    // ===========================================

    public getNotificationsCountForUser(ID: any): Promise<Number> {
        let userConnection: string = environment.apiURL + 'api/notification';
        const current = userConnection + '/' + ID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                console.log(data);
                let temp = data.notifications as Notification[];
                if (temp == null) {
                    return 0;
                }

                this._socketService.socket.emit('tellTopBar', temp.length);
                // TODO: Improvement Suggestion: Also create a notification_request_event
                // to get notifications and the total count via socket call.
                return temp.length;
            })
            .catch(this.handleError);
    }

    public getNotificationsForUser(ID: any): Promise<Notification[]> {
        let userConnection: string = environment.apiURL + 'api/notification';
        const current = userConnection + '/' + ID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                //inserting test notifications until i can actually send them.
                let temp = data.notifications as Notification[];
                // console.log(data);
                let t: Notification[] = [];

                if (temp == null) {
                    // this.io.emit('tellNotificationPanel', t)
                    return t;
                }

                this._socketService.socket.emit('tellNotificationPanel', temp)
                // this._socketService.socket.emit('tellTopBar', temp.length)

                return temp;
            })
            .catch(this.handleError);
    }
}
