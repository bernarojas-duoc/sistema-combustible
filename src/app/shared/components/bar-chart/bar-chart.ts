import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js/auto';

/**
 * Gráfico de barras basado en **Chart.js** (librería gratuita, MIT). Recibe las
 * series por `@Input` y resalta en rojo la barra de mayor valor, útil para
 * detectar, por ejemplo, el mes de mayor gasto en combustible.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <div class="ratio ratio-21x9">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class BarChart implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  /** Etiquetas del eje X (una por barra). */
  @Input({ required: true }) labels: string[] = [];
  /** Valores de cada barra (mismo orden que las etiquetas). */
  @Input({ required: true }) values: number[] = [];
  /** Prefijo para los valores mostrados en tooltips y eje (ej. '$'). */
  @Input() prefijo = '';
  /** Etiqueta de la serie de datos. */
  @Input() titulo = 'Gasto (CLP)';
  /** Si es `true`, resalta en rojo la barra de mayor valor. */
  @Input() resaltarMax = true;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    // Si la vista ya existe, redibuja al cambiar los datos.
    if (this.chart) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvas) return;
    this.chart?.destroy();

    const max = Math.max(...this.values);
    const colores = this.values.map((v) =>
      this.resaltarMax && this.values.length > 1 && v === max ? '#ef4444' : '#f59e0b', // rojo el mayor; resto amarillo
    );

    const prefijo = this.prefijo;
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.titulo,
            data: this.values,
            backgroundColor: colores,
            borderRadius: 6,
            maxBarThickness: 64,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${prefijo}${(ctx.parsed.y ?? 0).toLocaleString('es-CL')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9ca3af' },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: {
              color: '#9ca3af',
              callback: (value) => `${prefijo}${Number(value).toLocaleString('es-CL')}`,
            },
          },
        },
      },
    });
  }
}
