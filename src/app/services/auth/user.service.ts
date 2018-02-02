// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { AppModule } from 'app/app.module';

@Injectable()
export class UserService {
    public connection: string = AppModule.currentHost + 'api/auth';
    public userConnection: string = AppModule.currentHost + 'api/users';
    // public connection: string = 'https://localbeats.herokuapp.com/api/auth';
    // public userConnection: string = 'https://localbeats.herokuapp.com/api/users';
    // public getUserConnection: string = 'https://localbeats.herokuapp.com/api/user';
    public accessToken: string = null;
    public user: User = null;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

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
        // const num = ID["id"];
        const current = this.userConnection + '/' + ID;
        //console.log("getting: ");
        //console.log(current);
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

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}