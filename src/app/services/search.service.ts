import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';

@Injectable()
export class SearchService {
    public connection: string = 'http://localhost:8080/api/';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor (private http: Http) {}

    // Search through events
    // params
    // skip (int) how many records to skip
    // limit (int) how many records to return
    // event_type (string) ("wedding", "birthday")
    // event_genre (string) ("rock", etc)
    // from_date & to_date (string) ISODate
    // min_budget & max_budget (int)
    // booked (boolean) defaults ot false. If true returns events that are currently booked
    // lat (string) & lon (string) & distance (int, metres)
    // name (string) fuzzy match search by event names
    // get("/api/search")
    public eventSearch(searchTerms: SearchTerms): Promise<Object> {
        let current = (this.connection + 'searchEvents/')
        let params: URLSearchParams = new URLSearchParams();
        params.set('event_type', searchTerms.genre.toLowerCase())
        params.set('lat', String(searchTerms.location.latitude))
        params.set('lon', String(searchTerms.location.longitude))
        params.set('limit', '5')
        if (searchTerms.text != null && searchTerms.text.length != 0) {
            params.set('name', searchTerms.text)
        }
        
        return this.http.get(current, { headers: this.headers, search: params } )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                console.log(response)
                console.log(data)
                const events = data.events as Array<Event>;
                return events;
            })
            .catch(this.handleError);
    }

    public userSearch(searchTerms: SearchTerms): Promise<Object> {
        let current = (this.connection + 'searchUsers/')
        let params: URLSearchParams = new URLSearchParams();
        params.set('artist', 'false')
        params.set('genre', 'Rap')
        params.set('name', 'Ni')
        // params.set('lat', String(searchTerms.location.latitude))
        // params.set('lon', String(searchTerms.location.longitude))
        if (searchTerms.text != null && searchTerms.text.length != 0) {
            params.set('name', searchTerms.text)
        }
        
        return this.http.get(current, { headers: this.headers, search: params } )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const users = data.users as Array<User>;
                return users;
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