import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { Rate } from '../../models/rate.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-quote-table',
  templateUrl: './quote-table.component.html',
  styleUrls: ['./quote-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteTableComponent implements OnInit {
  rates$: Observable<Rate[]> = of([]);

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit() {
    this.rates$ = this.exchangeRateService
      .getRates()
      .pipe(map((rates: Rate[]) => rates || []));
  }
}
