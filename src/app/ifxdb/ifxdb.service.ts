import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from  'rxjs/operators';
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class IfxDBService {

    constructor(private http: HttpService,) {
    }

    jsonParser(key,value) {
        if ( key == 'Measurements') {
            return String(value).split(',');
        }
        return value;
    }

    addIfxDBItem(dev) {
        return this.http.post('/api/cfg/ifxdb',JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));

    }

    editIfxDBItem(dev, id) {
        return this.http.put('/api/cfg/ifxdb/'+id,JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));
    }


    getIfxDBItem(filter_s: string) {
        return this.http.get('/api/cfg/ifxdb')
        .pipe(map( (responseData) => responseData.json()));
    }

    getIfxDBItemById(id : string) {
        // return an observable
        console.log("ID: ",id);
        return this.http.get('/api/cfg/ifxdb/'+id)
        .pipe(map( (responseData) => responseData.json()));
    };

    getIfxDBCfgArrayByMeasName(id : string) {
        return this.http.get('/api/cfg/ifxdb/bymeasname/'+id)
        .map( (responseData) =>
            responseData.json()
    )};

    checkOnDeleteIfxDBItem(id : string){
      return this.http.get('/api/cfg/ifxdb/checkondel/'+id)
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

    deleteIfxDBItem(id : string) {
        // return an observable
        return this.http.delete('/api/cfg/ifxdb/'+id)
        .pipe(map( (responseData) => responseData.json() ));
    };
}
