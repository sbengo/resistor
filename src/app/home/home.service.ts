import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../core/http.service';


declare var _:any;

@Injectable()
export class HomeService {

    constructor(private http: HttpService) {
        console.log('Task Service created.', http);
    }

    userLogout() {
        return this.http.post('/logout','',null,true)
        .pipe(map( (responseData) => true));
    }

    getInfo() {
        // return an observable
        return this.http.get('/api/rt/agent/info/version/')
        .pipe(map( (responseData) => responseData.json()));
    }

    reloadConfig() {
        return this.http.get('/api/rt/agent/reload/')
        .pipe(map( (responseData) =>  responseData.json()));
    }
}
