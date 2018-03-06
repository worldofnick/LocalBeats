// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocketService } from '../../services/chats/socket.service';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { environment } from '../../../environments/environment';

// For Angular 5 HttpClient Module
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UserService {
    public connection: string = environment.apiURL + 'api/auth';
    public userConnection: string = environment.apiURL + 'api/users';
    private persistedUser = new BehaviorSubject<User>(null);
    public userResult = this.persistedUser.asObservable();

    public accessToken: string = null;
    public user: User = null;
    ioConnection: any;
    action = Action;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http, private _socketService: SocketService, private _httpClient: HttpClient) { }

    userLoaded(user: User, token: string, persisted: boolean, logout: boolean) {
        this.user = user;
        this.accessToken = token;
        this.persistedUser.next(user);
        if (!logout) {
            this.initIoConnection(persisted);
        }
    }

    private initIoConnection(persisted: boolean): void {
            this.ioConnection = this._socketService.onEvent(SocketEvent.NEW_LOG_IN)
                .subscribe((message: Message) => {
                    // this.messages.push(message);
                    console.log('Server Msg to user service', message);
                });
        if (persisted) {
            let message: Message = {
                from: this.user,
                action: Action.PERSISTED_LOGIN
            }
            this._socketService.send(SocketEvent.PERSISTED_LOGIN, message);
        }
    }

    // post("api/auth/passwordChange/:uid')
    public signupUser(newUser: User): Promise<User> {
        const current = this.connection + '/register';
        return this.http.post(current, newUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.token;
                localStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;

                // Notify server that a new user user logged in
                this._socketService.send(Action.NEW_LOG_IN, {
                    from: this.user,
                    action: Action.NEW_LOG_IN
                });

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
                return this.user
            })
            .catch(this.handleError);
    }

    private notifyServerToAddGreetBot(to: User) {
        this._socketService.send(Action.GREET_WITH_BEATBOT, {
            to: this.user,
            action: Action.GREET_WITH_BEATBOT
        });
    }

    // post("/api/authenticate")
    public signinUser(returningUser: User): Observable<Object> {
        const current = this.connection + '/authenticate';
        return this.http.post(current, returningUser, { headers: this.headers })
            .map((response: Response) => {
                console.log('IN LOGIn');
                const data = response.json();
                this.accessToken = data.token;
                localStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;
                // Notify server that a new user user logged in
                this._socketService.send(Action.NEW_LOG_IN, {
                    from: this.user,
                    action: Action.NEW_LOG_IN
                });
                return data;
            }).catch((error: Response) => {
                if (error.status === 404) {
                    return Observable.throw('Wrong email.  Please try again.');
                } else if (error.status === 401) {
                    return Observable.throw('Wrong password.  Please try again.');
                } else {
                    return Observable.throw('Error Unknown');
                }
            });
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

                this.userLoaded(null, null, false, true);
            })
            .catch(this.handleError);
    }

    public isAuthenticated() {
        return this.accessToken != null;
    }





    /***********************
     * 
     * 
     * N O T I F I C A T I O N S
     * 
     * 
     *************************/


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
}