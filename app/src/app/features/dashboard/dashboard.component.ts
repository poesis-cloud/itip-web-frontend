import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

type StatCard = {
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
  imports: [CommonModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly statCards: StatCard[] = [
    { label: 'Structures', valueSlot: 'API slot', caption: 'Will be fed by structure summary API' },
    { label: 'Directives', valueSlot: 'API slot', caption: 'Will be fed by governance metrics API' },
    { label: 'Ascriptions', valueSlot: 'API slot', caption: 'Will be fed by runtime snapshot API' },
    { label: 'Compliance', valueSlot: 'API slot', caption: 'Will be fed by compliance aggregation API' },
    { label: 'Open violations', valueSlot: 'API slot', caption: 'Will be fed by findings API' },
  ];

  readonly trendLegend: LegendItem[] = [
    { label: 'Overall', tone: 'primary' },
    { label: 'Target', tone: 'neutral' },
  ];

  readonly lifecycleLegend: LegendItem[] = [
    { label: 'Active', tone: 'success' },
    { label: 'Draft', tone: 'neutral' },
    { label: 'Deprecated', tone: 'warning' },
    { label: 'Proposed', tone: 'primary' },
  ];

  readonly findingsRows: SectionRow[] = [
    { title: 'GDPR', detail: 'Findings feed slot' },
    { title: 'NIS2', detail: 'Findings feed slot' },
    { title: 'ISO 25010', detail: 'Findings feed slot' },
    { title: 'TOGAF', detail: 'Findings feed slot' },
    { title: 'DORA', detail: 'Findings feed slot' },
  ];

  readonly approvalsRows: SectionRow[] = [
    { title: 'Directive · API Gateway MUST ENFORCE rate limiting', detail: 'Approval feed slot' },
    { title: 'Norm · encryption_at_rest on DataStore', detail: 'Approval feed slot' },
    { title: 'Structure · Payment Service (new)', detail: 'Approval feed slot' },
  ];
}
