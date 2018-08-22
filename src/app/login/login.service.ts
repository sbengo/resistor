import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../core/http.service';

declare var _:any;

@Injectable()
export class LoginService {

    constructor(private http: HttpService) {
    }

    login(data) {
        return  this.http.post('/login', data, null, true)
        .pipe(map( (responseData) => responseData.json()));
    }
}
