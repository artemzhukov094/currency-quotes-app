import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateApiResponse } from '../models/exchange-rate-api-response';
import { Rate } from '../models/rate.model';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://v6.exchangerate-api.com/v6';
  const apiKey = '87a5ee8e5b86dc8f2edf5a54';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExchangeRateService],
    });

    service = TestBed.inject(ExchangeRateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve and format exchange rates correctly', fakeAsync(() => {
    const mockApiResponse: ExchangeRateApiResponse = {
      conversion_rates: {
        EUR: 0.85,
        GBP: 0.75,
        JPY: 110,
      },
    };

    let ratesResult: Rate[] = [];

    service.getRates().subscribe({
      next: (rates: Rate[]) => {
        ratesResult = rates;
      },
      error: () => {},
    });

    tick(1000);
    tick(500);

    const req = httpMock.expectOne(`${apiUrl}/${apiKey}/latest/USD`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);

    expect(ratesResult.length).toBeGreaterThan(0);

    const eurRate = ratesResult.find((rate) => rate.symbol === 'EUR');
    expect(eurRate).toEqual(
      jasmine.objectContaining({
        symbol: 'EUR',
        bid: 0.85,
        ask: 0.8502,
      }),
    );
  }));

  it('should handle errors and retry the request', fakeAsync(() => {
    let ratesResult: Rate[] = [];
    let errorResult: any;

    service.getRates().subscribe({
      next: (rates: Rate[]) => {
        ratesResult = rates;
      },
      error: (error) => {
        errorResult = error;
      },
    });

    tick(1000);
    tick(500);

    const req1 = httpMock.expectOne(`${apiUrl}/${apiKey}/latest/USD`);
    expect(req1.request.method).toBe('GET');
    req1.flush(null, { status: 500, statusText: 'Server Error' });

    for (let i = 0; i < 3; i++) {
      tick(1000);
      tick(500);

      const retryReq = httpMock.expectOne(`${apiUrl}/${apiKey}/latest/USD`);
      expect(retryReq.request.method).toBe('GET');
      retryReq.flush(null, { status: 500, statusText: 'Server Error' });
    }

    expect(ratesResult.length).toBe(0);
    expect(errorResult).toBeDefined();
  }));
});
