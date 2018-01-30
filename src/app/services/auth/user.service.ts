// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification'
import * as socketIO from 'socket.io-client';

@Injectable()
export class UserService {
    public connection: string = 'http://localhost:8080/api/auth';
    public userConnection: string = 'http://localhost:8080/api/users';
    // public connection: string = 'https://localbeats.herokuapp.com/api/auth';
    // public userConnection: string = 'https://localbeats.herokuapp.com/api/users';
    // public getUserConnection: string = 'https://localbeats.herokuapp.com/api/user';
    public accessToken: string = null;
    public user: User = null;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    io = socketIO('http://localhost:8080');
    id:any;

    constructor(private http: Http) { }

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
                return this.user
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
        return this.http.post(current, returningUser, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;
                return this.user
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
        let newPassword:string = user.password;
        return this.http.put(current, {'newPassword': newPassword}, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken }))
                this.user = data.user as User;
                return this.user
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
        this.accessToken = null;
        this.user = null;
        sessionStorage.clear();
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


    public getNotificationsCountForUser(ID: any): Promise<Number>{
        let userConnection: string = 'http://localhost:8080/api/users';
        const current = userConnection + '/' + ID;
        //console.log("getting: ");
        //console.log(current);
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // console.log(this.accessToken)
                let temp = data.user as User;
                let not1:Notification = new Notification;
                not1.icon = "home"
                not1.message = "hello world"
                temp.notifications.push(not1);
                temp.notifications.push(not1);

                this.io.emit('tellTopBar', temp.notifications.length)
                return temp.notifications.length;
            })
            .catch(this.handleError);
    }


    public getNotificationsForUser(ID: any): Promise<Notification[]>{
        let userConnection: string = 'http://localhost:8080/api/users';
        const current = userConnection + '/' + ID;
        //console.log("getting: ");
        //console.log(current);
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                // this.accessToken = data.token;
                // console.log(this.accessToken)
                //inserting test notifications until i can actually send them.
                let temp = data.user as User;
                let not1:Notification = new Notification;
                not1.icon = "chat"
                not1.message = "helloo world"
                temp.notifications.push(not1);
                temp.notifications.push(not1);

                this.io.emit('tellNotificationPanel', temp.notifications)
                return temp.notifications;
            })
            .catch(this.handleError);
    }



    public sendNotificationToUser(notification: Notification): Promise<any> {


        this.getUserByID(notification.receiverID).then((receiver:User) =>{

        //update the receiving user object w/ an additional notification in the list.
        let userConnection: string = 'http://localhost:8080/api/users';
        const current = userConnection + '/' + receiver._id;        
        receiver.notifications.push(notification);

        console.log("sending:");
        console.log(JSON.stringify(receiver));

        return this.http.put(current, { user: JSON.stringify(receiver) }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                console.log(data);
                this.user = data.user as User;
                console.log(this.user)
                return this.user;
            })
            .catch(this.handleError); 
        })

        return;

    }

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}