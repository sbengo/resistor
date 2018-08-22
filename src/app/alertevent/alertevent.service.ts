import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class AlertEventService {

    constructor(private http: HttpService,) {
    }

    jsonParser(key,value) {
        return value;
    }

    editAlertEventItem(dev, id) {
        return this.http.put('/api/cfg/alertevent/'+id,JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));
    }

    getAlertEventItem(filter_s: string) {
        return this.http.get('/api/cfg/alertevent')
        .pipe(map( (responseData) => responseData.json()));
    }

    getAlertEventItemById(id : string) {
        // return an observable
        console.log("ID: ",id);
        return this.http.get('/api/cfg/alertevent/'+id)
        .pipe(map( (responseData) => responseData.json()))
    }
}
