import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { LocaleService } from '../../core/i18n/locale.service';

type StatCard = {
  id: string;
  label: string;
  valueSlot: string;
  caption: string;
};

type LegendItem = {
  label: string;
  tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

type SectionRow = {
  title: string;
  detail: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslocoPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(LocaleService);

  readonly statCards = computed<StatCard[]>(() => {
    this.locale.currentLanguage();

    return [
      {
        id: 'structures',
        label: this.t('dashboard.stats.structures.label'),
        valueSlot: this.t('dashboard.placeholders.apiSlot'),
        caption: this.t('dashboard.stats.structures.caption'),
      },
      {
        id: 'directives',
        label: this.t('dashboard.stats.directives.label'),
        valueSlot: this.t('dashboard.placeholders.apiSlot'),
        caption: this.t('dashboard.stats.directives.caption'),
      },
      {
        id: 'ascriptions',
        label: this.t('dashboard.stats.ascriptions.label'),
        valueSlot: this.t('dashboard.placeholders.apiSlot'),
        caption: this.t('dashboard.stats.ascriptions.caption'),
      },
      {
        id: 'compliance',
        label: this.t('dashboard.stats.compliance.label'),
        valueSlot: this.t('dashboard.placeholders.apiSlot'),
        caption: this.t('dashboard.stats.compliance.caption'),
      },
      {
        id: 'openViolations',
        label: this.t('dashboard.stats.openViolations.label'),
        valueSlot: this.t('dashboard.placeholders.apiSlot'),
        caption: this.t('dashboard.stats.openViolations.caption'),
      },
    ];
  });

  readonly trendLegend = computed<LegendItem[]>(() => {
    this.locale.currentLanguage();

    return [
      { label: this.t('dashboard.legend.overall'), tone: 'primary' },
      { label: this.t('dashboard.legend.target'), tone: 'neutral' },
    ];
  });

  readonly lifecycleLegend = computed<LegendItem[]>(() => {
    this.locale.currentLanguage();

    return [
      { label: this.t('dashboard.lifecycle.active'), tone: 'success' },
      { label: this.t('dashboard.lifecycle.draft'), tone: 'neutral' },
      { label: this.t('dashboard.lifecycle.deprecated'), tone: 'warning' },
      { label: this.t('dashboard.lifecycle.proposed'), tone: 'primary' },
    ];
  });

  readonly findingsRows = computed<SectionRow[]>(() => {
    this.locale.currentLanguage();

    return [
      { title: 'GDPR', detail: this.t('dashboard.placeholders.findingsFeedSlot') },
      { title: 'NIS2', detail: this.t('dashboard.placeholders.findingsFeedSlot') },
      { title: 'ISO 25010', detail: this.t('dashboard.placeholders.findingsFeedSlot') },
      { title: 'TOGAF', detail: this.t('dashboard.placeholders.findingsFeedSlot') },
      { title: 'DORA', detail: this.t('dashboard.placeholders.findingsFeedSlot') },
    ];
  });

  readonly approvalsRows = computed<SectionRow[]>(() => {
    this.locale.currentLanguage();

    return [
      {
        title: this.t('dashboard.approvals.directiveTitle'),
        detail: this.t('dashboard.placeholders.approvalFeedSlot'),
      },
      {
        title: this.t('dashboard.approvals.normTitle'),
        detail: this.t('dashboard.placeholders.approvalFeedSlot'),
      },
      {
        title: this.t('dashboard.approvals.structureTitle'),
        detail: this.t('dashboard.placeholders.approvalFeedSlot'),
      },
    ];
  });

  readonly monthAxis = computed<string[]>(() => {
    this.locale.currentLanguage();
    return this.transloco.translateObject<string[]>('dashboard.chart.months');
  });

  private t(key: string): string {
    return this.transloco.translate(key);
  }
}
