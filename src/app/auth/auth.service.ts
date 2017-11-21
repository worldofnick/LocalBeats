import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';

@Injectable()
export class AuthService {
    public connection: string = '/api/auth';
    public user: User = null;

    constructor (private http: Http) {}

    // post("/api/auth/signup")
    public signupUser(newUser: User): Promise<User> {
        this.connection += '/signup';
        return this.http.post(this.connection, newUser)
            .toPromise()
            .then(response => {
                this.user = response.json() as User
                return this.user
            })
            .catch(this.handleError);
    }

    // post("/api/auth/signin")
    public signinUser(returningUser: User): Promise<User> {
        this.connection += '/signin';
        return this.http.post(this.connection, returningUser)
            .toPromise()
            .then(response => {
                this.user = response.json() as User
                return this.user
            })
            .catch(this.handleError);
    }

    public isAuthenticated() {
        return this.user.token != null;
    }

    private handleError (error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}