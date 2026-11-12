import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { formatDate, timeAgo, today, topCategories } from './format';
import { NewsService } from './news.service';
import { Thumb } from './thumb';
import { Source } from './types';

@Component({
  selector: 'app-root',
  imports: [Thumb, NgTemplateOutlet],
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

  protected sourceOf(id: string): Source | undefined {
    return this.sources().get(id);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
