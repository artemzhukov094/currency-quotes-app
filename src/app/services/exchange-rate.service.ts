import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, throwError } from 'rxjs';
import { map, switchMap, bufferTime, catchError, retry } from 'rxjs/operators';
import { Rate } from '../models/rate.model';
import { ExchangeRateApiResponse } from '../models/exchange-rate-api-response';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  private apiUrl = 'https://v6.exchangerate-api.com/v6';
  private apiKey = '87a5ee8e5b86dc8f2edf5a54';

  constructor(private http: HttpClient) {}

  getRates(): Observable<Rate[]> {
    return interval(1000).pipe(
      switchMap(() =>
        this.http
          .get<ExchangeRateApiResponse>(
            `${this.apiUrl}/${this.apiKey}/latest/USD`,
          )
          .pipe(
            retry(3),
            catchError((error) => {
              console.error('Ошибка при получении курсов валют:', error);
              return throwError(() => error);
            }),
          ),
      ),
      map((response) =>
        Object.keys(response.conversion_rates).map(
          (symbol) =>
            ({
              time: new Date(),
              symbol,
              bid: response.conversion_rates[symbol],
              ask: response.conversion_rates[symbol] + 0.0002,
            }) as Rate,
        ),
      ),
      bufferTime(500),
      map((ratesArrays: Rate[][]) => ratesArrays.flat()),
    );
  }
}
