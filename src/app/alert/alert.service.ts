import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class AlertService {

    constructor(private http: HttpService,) {
    }

    jsonParser(key,value) {
        if ( key == 'Active' || key == 'IsCustomExpression' ) {
            return ( value === "true" || value === true);
        }
        if ( key == 'ExtraData' && (value == null || value.length == 0)) {
            return 0;
        }
        return value;
    }

    addAlertItem(dev) {
        return this.http.post('/api/cfg/alertid',JSON.stringify(dev,this.jsonParser))
        .pipe(map((responseData) => responseData.json()));

    }

    deployAlertItem(dev) {
        return this.http.post('/api/cfg/alertid/deploy',JSON.stringify(dev,this.jsonParser))
        .pipe(map((responseData) => responseData.json()));

    }

    editAlertItem(dev, id) {
        return this.http.put('/api/cfg/alertid/'+id,JSON.stringify(dev,this.jsonParser))
        .pipe(map((responseData) => responseData.json()));
    }


    getAlertItem(filter_s: string) {
        return this.http.get('/api/cfg/alertid')
        .pipe(map( (responseData) => responseData.json()));
    }

    getAlertItemById(id : string) {
        // return an observable
        console.log("ID: ",id);
        return this.http.get('/api/cfg/alertid/'+id)
        .pipe(map( (responseData) => responseData.json()))
    };


    checkOnDeleteAlertItem(id : string){
        return this.http.get('/api/cfg/alertid/checkondel/'+id)
        .pipe(map( (responseData) =>
         responseData.json()
        ),map((deleteobject) => {
            console.log("MAP SERVICE",deleteobject);
            let result : any = {'ID' : id};
            _.forEach(deleteobject,function(value,key){
                result[value.TypeDesc] = [];
            });
            _.forEach(deleteobject,function(value,key){
                result[value.TypeDesc].Description=value.Action;
                result[value.TypeDesc].push(value.ObID);
            });
            return result;
        }));
      };

      deleteAlertItem(id : string) {
        // return an observable
        return this.http.delete('/api/cfg/alertid/'+id)
        .pipe(map( (responseData) => responseData.json()));
    };
}
