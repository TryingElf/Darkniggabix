import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncarrecsService } from '../../services/encarrecs.service';
import { NotificationService } from '../../services/notification.service';
import { Encarrec } from '../../models/encarrec.model';

@Component({
  selector: 'app-encarrecs',
  imports: [ReactiveFormsModule],
  templateUrl: './encarrecs.html',
  styleUrl: './encarrecs.css'
})
export class Encarrecs implements OnInit {
  private service = inject(EncarrecsService);
  private notif  = inject(NotificationService);
  private fb     = inject(FormBuilder);

  items   = signal<Encarrec[]>([]);
  loading = signal(false);
  showForm = signal(false);

  form = this.fb.group({
    producte:   ['', Validators.required],
    categoria:  ['', Validators.required],
    quantitat:  [null as number | null, [Validators.required, Validators.min(1)]],
    email:      ['', [Validators.required, Validators.email]],
    pressupost: [null as number | null],
    notes:      [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => { this.notif.show('Error carregant els encàrrecs', 'error'); this.loading.set(false); },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.service.submit({
      producte:   v.producte!,
      categoria:  v.categoria as 'weapons' | 'drugs' | 'organs',
      quantitat:  v.quantitat!,
      email:      v.email!,
      pressupost: v.pressupost || null,
      notes:      v.notes || null,
    }).subscribe({
      next: item => {
        this.items.update(list => [item, ...list]);
        this.form.reset();
        this.showForm.set(false);
        this.notif.show('Encàrrec enviat. Ens posarem en contacte.', 'success');
      },
      error: err => {
        const msg = err.error?.error ?? 'Error enviant l\'encàrrec';
        this.notif.show(msg, 'error');
      },
    });
  }

  delete(id: number, producte: string): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== id));
        this.notif.show(`Encàrrec "${producte}" cancel·lat`, 'success');
      },
      error: () => this.notif.show('Error cancel·lant l\'encàrrec', 'error'),
    });
  }

  fi(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  catLabel(cat: string): string {
    return { weapons: 'Armes', drugs: 'Drogues', organs: 'Organs' }[cat] ?? cat;
  }
}
