// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Review } from 'app/models/review';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { environment } from '../../../environments/environment';

const SERVER_URL = environment.apiURL;


@Injectable()
export class ReviewService {

    public connection: string = 'http://localhost:8080/api/reviews';
    public userReviewsToConnection: string = 'http://localhost:8080/api/userReviewsTo';
    public userReviewsFromConnection: string = 'http://localhost:8080/api/userReviewsFrom';
    public FlagReviewFromConnection: string = 'http://localhost:8080/api/userReviewsFrom';
    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    

    constructor(private http: Http) { }

    // POST Create review
    public crateReview(newReview: Review): Promise<Review> {
        const current = this.connection + '/create';
        
        return this.http.post(current, { review: newReview }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const review = data.review as Review;
                return review
            })
            .catch(this.handleError);
    }

    // GET a review via _id
    public getReview(review: Review): Promise<Review> {
        const current = this.connection + '/' + review._id;

        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const review = data.review as Review;
                return review;
            })
            .catch(this.handleError);
    }

    // PUT update a review
    public updateReview(review: Review): Promise<Review> {
        const current = this.connection + '/' + review._id;

        return this.http.put(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const review = data.review as Review;
                return review;
            })
            .catch(this.handleError);
    }

    // DELETE delete a review by id
    public deleteReviewByRID(reviewToDelete: Review): Promise<Number> {
        const current = this.connection + '/' + reviewToDelete._id;
        return this.http.delete(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.status;
                return data as Number;
            })
            .catch(this.handleError);
    }

    // GET gets all reviews left for this user
    public getReviewsTo(user: User): Promise<Review[]> {
        const current = this.userReviewsToConnection + '/?uid=' + user._id;
        return this.http.get(current)
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            let reviews:Review[];
            reviews = data.reviews as Review[];
            return reviews
        })
        .catch(this.handleError);
    }

    // GET gets all reviews left for this user
    public getReviewsFrom(user: User): Promise<Review[]> {
        const current = this.userReviewsFromConnection + '/?uid=' + user._id;
        return this.http.get(current)
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            let reviews:Review[];
            reviews = data.reviews as Review[];
            return reviews
        })
        .catch(this.handleError);
    }

    // Can add flag review if needed

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}