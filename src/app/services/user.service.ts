// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';

@Injectable()
export class UserService {
    // public connection: string = 'http://localhost:8080/api/auth';
    // public userConnection: string = 'http://localhost:8080/api/users';
    public connection: string = 'https://localbeats.herokuapp.com/api/auth';
    public userConnection: string = 'https://localbeats.herokuapp.com/api/users';
    public accessToken: string = null;
    public user: User = null;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor (private http: Http) {}

    // post("/api/user")
    public signupUser(newUser: User): Promise<User> {
        const current = this.connection + '/register';
        return this.http.post(current, newUser, {headers: this.headers} )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken}))
                this.user = data.user as User;
                return this.user
            })
            .catch(this.handleError);
    }

    // post("/api/profile-edit")
    public onEditProfile(newUser: User): Promise<User> {
        const current = this.userConnection + '/' + newUser._id;
        console.log("sending user : ");
        console.log(newUser);
        return this.http.put(current, {user : newUser}, {headers: this.headers} )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.user = data.user as User;
                console.log("user response obj");
                console.log(this.user);
                return this.user
            })
            .catch(this.handleError);
    }

    // post("/api/authenticate")
    public signinUser(returningUser: User): Promise<User> {
        // this.connection = 'http://localhost:8080/api/auth/authenticate';
        const current = this.connection + '/authenticate';
        return this.http.post(current, returningUser, {headers: this.headers})
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken}))
                this.user = data.user as User;
                return this.user
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

    private handleError (error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}