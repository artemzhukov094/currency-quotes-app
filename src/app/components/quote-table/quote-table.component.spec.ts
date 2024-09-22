import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { QuoteTableComponent } from './quote-table.component';
import { Rate } from '../../models/rate.model';
import { By } from '@angular/platform-browser';

describe('QuoteTableComponent', () => {
  let component: QuoteTableComponent;
  let fixture: ComponentFixture<QuoteTableComponent>;
  let exchangeRateService: jasmine.SpyObj<ExchangeRateService>;

  beforeEach(async () => {
    const rates: Rate[] = [
      { time: new Date(), symbol: 'EUR', bid: 0.85, ask: 0.8502 },
      { time: new Date(), symbol: 'GBP', bid: 0.75, ask: 0.7502 },
    ];

    const spy = jasmine.createSpyObj('ExchangeRateService', ['getRates']);
    spy.getRates.and.returnValue(of(rates));

    await TestBed.configureTestingModule({
      declarations: [QuoteTableComponent],
      providers: [{ provide: ExchangeRateService, useValue: spy }],
    }).compileComponents();

    exchangeRateService = TestBed.inject(
      ExchangeRateService,
    ) as jasmine.SpyObj<ExchangeRateService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have rates from the service', () => {
    component.rates$.subscribe((rates) => {
      expect(rates.length).toBe(2);
      expect(rates[0].symbol).toBe('EUR');
      expect(rates[1].symbol).toBe('GBP');
    });
  });

  it('should display rates in the table', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[1].nativeElement.textContent).toContain('EUR');
    expect(firstRowCells[2].nativeElement.textContent).toContain('0.8500');
    expect(firstRowCells[3].nativeElement.textContent).toContain('0.8502');
  });
});
