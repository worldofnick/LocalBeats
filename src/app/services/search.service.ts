import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';

@Injectable()
export class SearchService {
    public connection: string = '/api/search/';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor (private http: Http) {}

    // post("/api/search")
    public search(searchTerms: SearchTerms): Promise<Object> {
        return this.http.post(this.connection, searchTerms, { headers: this.headers } )
            .toPromise()
            .then((response: Response) => {
                const data = response.json()
                return data
            })
            .catch(this.handleError);
    }

    private handleError (error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}