import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, defer, Observable, of, Subject, takeUntil } from 'rxjs';
import { EventDispatcherService } from '@mfe1/core/services/events-dispatcher';
import {
  CustomEventConfig,
  MFE1Events,
} from '@mfe1/core/services/events-dispatcher';
import { MFE1State, selectUIWatchlist } from '../reducers';
import { WATCHLIST_COL_DEFS } from './watchlist.constants';
import { PollingService, randomStockPriceGenerator } from '@myorg/common-ui';

@Component({
  selector: 'mfe1-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent implements OnInit, OnDestroy {
  public readonly columnDefs = WATCHLIST_COL_DEFS;
  public dataSource = [];
  public watchlist?: string[];
  private readonly onDestroy$ = new Subject<void>();

  constructor(
    private pollingService: PollingService,
    private store: Store<MFE1State>,
    private eventDispatcher: EventDispatcherService,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.initGrid();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onBuyItem(item: string): void {
    const config: CustomEventConfig = { detail: item };
    this.eventDispatcher.dispatchEvent(MFE1Events.BUY_ITEM, config);
  }

  private initGrid(): void {
    this.initPollingStockData();
  }

  private getWatchlist(): Observable<string[]> {
    return this.store
      .select(selectUIWatchlist)
      .pipe(takeUntil(this.onDestroy$));
  }

  private initPollingStockData(): void {
    this.getWatchlist().subscribe((watchlist: string[]) => {
      this.watchlist = watchlist;
      this.cdr.detectChanges();

      const requests: Observable<any>[] = [];
      watchlist.forEach((symbol) =>
        requests.push(defer(() => of(randomStockPriceGenerator(symbol, 20))))
      );
      const combinedRequests = combineLatest(requests);

      this.pollingService.polling(combinedRequests, 1500).subscribe((data) => {
        this.dataSource = data as any;
        this.cdr.detectChanges();
      });
    });
  }
}