import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';

@Injectable()
export class SearchService {
    public connection: string = 'http://localhost:8080/api/';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    private resultSource = new BehaviorSubject<string>("default message");
    results = this.resultSource.asObservable();
    private searchTypeSource = new BehaviorSubject<string>("Musician");
    searchType = this.searchTypeSource.asObservable();

    constructor (private http: Http) {}

    changeResult(result: any, searchType: string) {
        this.resultSource.next(result);
        this.searchTypeSource.next(searchType);
    }

    public eventTypes(): Promise<Object> {
        let current = (this.connection + 'eventTypes/')
        return this.http.get(current, { headers: this.headers } )
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            const eventTypes = data.eventTypes as string[]
            return eventTypes;
        })
        .catch(this.handleError);
    }

    public genres(): Promise<Object> {
        let current = (this.connection + 'genres/')
        return this.http.get(current, { headers: this.headers } )
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            const genres = data.genres as Array<String>;
            return genres;
        })
        .catch(this.handleError);
    }

    public eventSearch(searchTerms: SearchTerms): Promise<Object> {
        let current = (this.connection + 'searchEvents/')
        let params: URLSearchParams = new URLSearchParams();
        console.log('Search Terms:');
        console.log(searchTerms);
        for(let type of searchTerms.event_types) {
            params.append('event_types', type.toLowerCase());
        }
        for(let genre of searchTerms.genres) {
            params.append('genres', genre.toLowerCase());
        }
        params.set('uid', searchTerms.uid);
        // params.set('lat', String(searchTerms.location.latitude));
        // params.set('lon', String(searchTerms.location.longitude));
        params.set('limit', '10');
        if (searchTerms.text != null && searchTerms.text.length != 0) {
            params.set('name', searchTerms.text)
        }
        
        return this.http.get(current, { headers: this.headers, search: params } )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const events = data.events as Array<Event>;
                console.log(events);
                return events;
            })
            .catch(this.handleError);
    }

    public userSearch(searchTerms: SearchTerms): Promise<Object> {
        let current = (this.connection + 'searchUsers/')
        let params: URLSearchParams = new URLSearchParams();
        params.set('artist', 'true')
        for(let type of searchTerms.event_types) {
            params.append('event_types', type.toLowerCase());
        }
        for(let genre of searchTerms.genres) {
            params.append('genres', genre.toLowerCase());
        }
        params.set('uid', searchTerms.uid);
        // params.set('lat', String(searchTerms.location.latitude));
        // params.set('lon', String(searchTerms.location.longitude));
        params.set('limit', '10');
        if (searchTerms.text != null && searchTerms.text.length != 0) {
            params.set('name', searchTerms.text)
        }
        
        return this.http.get(current, { headers: this.headers, search: params } )
            .toPromise()
            .then((response: Response) => {
                console.log(response);
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