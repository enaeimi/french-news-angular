import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { formatDate, timeAgo, today, topCategories } from './format';
import { NewsService } from './news.service';
import { Pager } from './pager';
import { pageCount, PagerLabels } from './paging';
import { Thumb } from './thumb';
import { Source } from './types';

@Component({
  selector: 'app-root',
  imports: [Thumb, NgTemplateOutlet, Pager],
  templateUrl: './app.html',
})
export class App {
  protected readonly news = inject(NewsService);
  protected readonly category = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly formatDate = formatDate;
  protected readonly timeAgo = timeAgo;
  protected readonly today = today();

  private readonly sources = computed(() => new Map((this.news.feed()?.sources ?? []).map((s) => [s.id, s])));
  protected readonly categories = computed(() => topCategories((this.news.feed()?.items ?? []).map((i) => i.category)));

  protected readonly items = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('fr');
    const cat = this.category();
    return (this.news.feed()?.items ?? []).filter(
      (i) =>
        (!cat || i.category === cat) &&
        (!q || i.title.toLocaleLowerCase('fr').includes(q) || i.summary.toLocaleLowerCase('fr').includes(q)),
    );
  });
  // The most recent article with an image is featured "À la une".
  protected readonly hero = computed(() => this.items().find((i) => i.image) ?? this.items()[0]);
  protected readonly rest = computed(() => this.items().filter((i) => i !== this.hero()));

  // Paging: 12 articles per page after the featured one; back to page 1 when a filter or the search changes.
  protected readonly labels: PagerLabels = { prev: '‹ Précédent', next: 'Suivant ›', nav: 'Pagination', num: (n: number) => String(n) };
  protected readonly page = linkedSignal(() => { this.category(); this.query(); return 1; });
  protected readonly pages = computed(() => pageCount(this.rest().length, 12));
  protected readonly pageItems = computed(() => {
    const page = Math.min(this.page(), this.pages());
    return this.rest().slice((page - 1) * 12, page * 12);
  });

  protected goTo(page: number): void {
    this.page.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected sourceOf(id: string): Source | undefined {
    return this.sources().get(id);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
