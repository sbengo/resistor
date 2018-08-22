import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class KapacitorService {

    constructor(private http: HttpService,) {
    }

    jsonParser(key,value) {
        return value;
    }

    addKapacitorItem(dev) {
        return this.http.post('/api/cfg/kapacitor',JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));

    }

    editKapacitorItem(dev, id) {
        return this.http.put('/api/cfg/kapacitor/'+id,JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));
    }


    getKapacitorItem(filter_s: string) {
        return this.http.get('/api/cfg/kapacitor')
        .pipe(map( (responseData) => responseData.json()));
    }

    getKapacitorItemById(id : string) {
        // return an observable
        console.log("ID: ",id);
        return this.http.get('/api/cfg/kapacitor/'+id)
        .pipe(map( (responseData) => responseData.json()));
    };

    checkOnDeleteKapacitorItem(id : string){
      return this.http.get('/api/cfg/kapacitor/checkondel/'+id)
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

    testKapacitorItem(instance) {
      // return an observable
      return this.http.post('/api/cfg/kapacitor/ping/',JSON.stringify(instance,function (key,value) {
          return value;
      }))
      .pipe(map((responseData) => responseData.json()));
    };

    deleteKapacitorItem(id : string) {
        // return an observable
        return this.http.delete('/api/cfg/kapacitor/'+id)
        .pipe(map( (responseData) => responseData.json()));
    };
}
