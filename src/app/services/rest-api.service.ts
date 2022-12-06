import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as uuid from "uuid";
import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  apim = "https://developer.sepa-cyber.com";
  muse = "https://gateway.sepa-cyber.com";

  httpOptionsApiManager = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('RrehqsrTtMXHSJYlOZiDDzpnGfMa:ZFycqHLQscf02zhHgF26WK5k0g8a')
    }),
  }

  httpHeaderOptions = {

    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('apiManager-token') || '',
      'tenantId': '498ab974-aff1-11ec-b909-0242ac120002',
      'ms-token': localStorage.getItem('apiManager-token') || '' })
  }



  constructor(private http: HttpClient) { }

  getApiManagerToken(): Observable<any> {
    const uniqueId = uuid.v4();
    const payload = {
      "grant_type": "client_credentials",
      "scope": `device_${uniqueId}`
    }
    return this.http
      .post<any>(
        '/oauth2/token',
        JSON.stringify(payload),
        this.httpOptionsApiManager
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  getSavedCards(customerId:string,orgId:string):Observable<any>{
    return this.http.get<any>(`ipg/1.0.0/payment/organizations/${orgId}/customers/${customerId}/saved-cards`,this.httpHeaderOptions)
    .pipe(retry(1), catchError(this.handleError));
  }

  // https://beta-wallet-business.7exchange.io/wallet/1.0.0/f75e0576-a2e7-42da-9937-31ade2e389fc/order/
  createOrder(walletId:string,payload:any):Observable<any>{
    return this.http.post<any>(`wallet/1.0.0/${walletId}/order`,JSON.stringify(payload),this.httpHeaderOptions)
    .pipe(retry(1), catchError(this.handleError));
  }


  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
