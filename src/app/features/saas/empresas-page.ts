import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Empresa, Plan } from '../../core/models/saas.model';
import { EmpresaFormDialog } from './empresa-form-dialog';
import { SaasService } from './saas.service';

@Component({
  selector: 'app-empresas-page',
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatTableModule, MatTooltipModule],
  templateUrl: './empresas-page.html',
  styleUrl: './saas-pages.scss',
})
export class EmpresasPage implements OnInit {
  private readonly service = inject(SaasService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly columnas = ['empresa', 'plan', 'vigencia', 'estado', 'acciones'];
  protected readonly empresas = signal<Empresa[]>([]);
  protected readonly planes = signal<Plan[]>([]);
  protected readonly cargando = signal(false);
  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly size = signal(10);
  protected readonly q = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.service.planes(true).subscribe((planes) => this.planes.set(planes));
    this.q.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.page.set(0); this.cargar(); });
    this.cargar();
  }
  protected cargar(): void {
    this.cargando.set(true);
    this.service.empresas({ q: this.q.value.trim() || undefined, page: this.page() + 1, size: this.size() }).subscribe({
      next: (r) => { this.empresas.set(r.items); this.total.set(r.total); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.snack.open('No se pudieron cargar las empresas.', 'Cerrar', { duration: 4000 }); },
    });
  }
  nueva(): void { this.abrir(null); }
  editar(empresa: Empresa): void { this.abrir(empresa); }
  private abrir(empresa: Empresa | null): void {
    this.dialog.open(EmpresaFormDialog, { data: { empresa, planes: this.planes() } }).afterClosed().subscribe((r) => { if (r) { this.snack.open('Empresa guardada.', 'OK', { duration: 2500 }); this.cargar(); } });
  }
  cambiarEstado(empresa: Empresa): void {
    this.service.actualizarEmpresa(empresa.id, { activa: !empresa.activa }).subscribe({ next: () => { this.snack.open(empresa.activa ? 'Empresa suspendida.' : 'Empresa reactivada.', 'OK', { duration: 2500 }); this.cargar(); }, error: () => this.snack.open('No se pudo cambiar el estado.', 'Cerrar', { duration: 4000 }) });
  }
  onPage(e: PageEvent): void { this.page.set(e.pageIndex); this.size.set(e.pageSize); this.cargar(); }
}
