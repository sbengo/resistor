import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class ProductService {

    constructor(private http: HttpService,) {
    }

    jsonParser(key,value) {
        if ( key == 'CommonTags' || key == 'ExtraTags' || key == 'BaseLines' || key == 'Measurements' || key == 'AlertGroups' ) {
            return String(value).split(',');
          }
        return value
    }

    addProductItem(dev) {
        return this.http.post('/api/cfg/product',JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));

    }

    editProductItem(dev, id) {
         return this.http.put('/api/cfg/product/'+id,JSON.stringify(dev,this.jsonParser))
        .pipe(map( (responseData) => responseData.json()));
    }


    getProductItem(filter_s: string) {
        return this.http.get('/api/cfg/product')
        .pipe(map( (responseData) => responseData.json()))
    }

    getProductItemById(id : string) {
        // return an observable
        console.log("ID: ",id);
        return this.http.get('/api/cfg/product/'+id)
        .pipe(map( (responseData) => responseData.json()))
    };

    checkOnDeleteProductItem(id : string){
      return this.http.get('/api/cfg/product/checkondel/'+id)
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
    }

    deleteProductItem(id : string) {
        // return an observable
        return this.http.delete('/api/cfg/product/'+id)
        .pipe(map( (responseData) => responseData.json()))
    };
}
