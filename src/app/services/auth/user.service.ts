// 'use strict';
import { Injectable } from '@angular/core';
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

    // Authentication Properties
    loggedIn: boolean;
    public accessToken: string = null;
    public user: User = null;

    /**
     * Checks the user session and sets/deletes it. 
     * Initializes the socket event listeners.
     * @param http To be deprecated
     * @param _socketService 
     * @param _httpClient Angular 5 
     */
    constructor(private http: Http, private _socketService: SocketService, private _httpClient: HttpClient) {
        // See if the user has an active session and load it.
        if (this.isAuthenticated()) {
            const token = localStorage.getItem('jwtToken');
            const user: User = JSON.parse(localStorage.getItem('loggedInUser'));
            
            this._setSession(token, user);
            this.getNotificationsCountForUser(user._id);
            this.getNotificationsForUser(user._id);
        } else {
            this._deleteSession(null);
        }

        // Initial socket event listeners
        this.initIoConnection();
    }

    // ================================================
    // Session Persistence methods
    // ================================================

    /**
     * Update login status subject
     * @param value true or false (logged in or not)
     */
    setLoggedIn(value: boolean) {
        this.loggedIn = value;
    }

    /**
     * Set the token, user in local storage,
     * sets the logged in status to true, and
     * notifies the server that a user has logged in
     */
    private _setSession(jwtAccessToken, user) {
        console.log('JWT Access Token: ', jwtAccessToken);
        console.log('Logged in user: ', user);

        localStorage.setItem('jwtToken', jwtAccessToken);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        this.user = user;
        this.accessToken = jwtAccessToken;
    
        this.notifyNewUserLoginToServer(user);      //TODO: later move it to signIn() method only for performance issues
        this.setLoggedIn(true);

        // this.getUserByID(user._id).then( (gottenUser: User) => {
        //     localStorage.setItem('loggedInUser', JSON.stringify(gottenUser));
        //     this.user = gottenUser;
        //     this.accessToken = jwtAccessToken;
    
        //     this.notifyNewUserLoginToServer(gottenUser);      //TODO: later move it to signIn() method only for performance issues
        //     this.setLoggedIn(true);
        // } );
    }

    /**
     * Deletes the token, the user in local storage,
     * sets the logged in status to false, and
     * notifies the server that a user has logged out
     */
    private _deleteSession(user) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUser');
        this.user = null;                       //TODO: change to undefined later based on what's preferred by Auth0
        this.accessToken = null;

        if (user !== null) {
            this.notifyUserLoggedOutToServer(user); //TODO: later move it to logout() method only for performance issues
        }
        this.setLoggedIn(false);
    }

    /**
     * Returns if the user has a valid session or not
     */
    public isAuthenticated() {
        // TODO: Check if current date is greater than expiration and if localSTrage token is not null
        // const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        // return Date.now() < expiresAt;
        // TODO: improve later so no token is persistently stored but managed by the server
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken === null) {
            return false;
        } else {
            // TODO: add waiting to load user object here
            this.accessToken = jwtToken;
            return true;
        }
    }

    public setUser(newUser: User) {
        localStorage.setItem('loggedInUser', JSON.stringify(newUser));
        // Acts a validation check if assigning from local storage
        this.user = JSON.parse(localStorage.getItem('loggedInUser'));
    }

    // ===============================================
    // User REST services
    // ===============================================

    // post("api/auth/passwordChange/:uid')
    public signupUser(newUser: User): Promise<User> {
        const current = this.connection + '/register';
        console.log(newUser)
        return this.http.post(current, newUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.user = data.user as User;
                this._setSession(data.token, (data.user as User));

                this.notifyServerToAddGreetBot(this.user);

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
                this._setSession(this.accessToken, this.user);
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
                this.user = data.user as User;
                this._setSession(data.token, (data.user as User));

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
        return this.http.put(current, { 'newPassword': newPassword }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
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
     */
    public getUserByID(ID: String): Promise<User> {
        const current = this.userConnection + '/' + ID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                console.log('Got user from server: ', data.user);
                let temp = data.user as User;
                return temp;
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
                this._deleteSession(from);
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

    // ===========================================
    // Notification Methods
    // ===========================================

    public getNotificationsCountForUser(ID: any): Promise<Number> {
        let userConnection: string = environment.apiURL + 'api/notification';
        // app.route('/api/notification/:uid')
        const current = userConnection + '/' + ID;
        // const current = userConnection + '/5a7113ac9d89a873c89fe5ff';
        //console.log("getting: ");
        //console.log(current);
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                console.log(data)
                // this.accessToken = data.token;
                // console.log(this.accessToken)
                let temp = data.notifications as Notification[];
                if (temp == null) {
                    return 0;
                }

                this._socketService.socket.emit('tellTopBar', temp.length)
                // this._socketService.send(Action.REQUEST_NOTIFICATION_COUNT, {
                //     from: 'tellTopBar',
                //     action: Action.SMN_LOGGED_OUT
                // });

                return temp.length;
            })
            .catch(this.handleError);
    }

    public getNotificationsForUser(ID: any): Promise<Notification[]> {
        let userConnection: string = environment.apiURL + 'api/notification';
        const current = userConnection + '/' + ID;
        // const current = userConnection + '/5a7113ac9d89a873c89fe5ff';

        //console.log("getting: ");
        //console.log(current);
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // console.log(this.accessToken)
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

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }

    // =====================================
    // Other method (WILL BE CHANGED LATER, DO NOT TOUCH)
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
}