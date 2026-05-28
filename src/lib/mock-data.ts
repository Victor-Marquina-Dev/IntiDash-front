import { Icon, IconComponent } from '@/components/icons';
import { C } from '@/lib/colors';

export interface Transaction {
  I: IconComponent;
  c: string;
  desc: string;
  cat: string;
  date: string;
  d: string;
  sign: '+' | '−';
  amt: string;
  acc: string;
}

export const ALL_TX: Transaction[] = [
  { I: Icon.utensils, c: C.neg,     desc: 'Mercadona',            cat: 'Comida',          date: '18 nov · 14:32', d: '2026-11-18', sign: '−', amt: '86.40',    acc: 'BBVA Débito' },
  { I: Icon.utensils, c: C.neg,     desc: 'Starbucks',            cat: 'Comida',          date: '18 nov · 09:15', d: '2026-11-18', sign: '−', amt: '5.80',     acc: 'Visa **23' },
  { I: Icon.car,      c: C.warn,    desc: 'Repsol — gasolina',    cat: 'Transporte',      date: '17 nov · 19:02', d: '2026-11-17', sign: '−', amt: '54.20',    acc: 'BBVA Débito' },
  { I: Icon.bag,      c: C.primary, desc: 'Amazon',               cat: 'Compras',         date: '16 nov · 22:48', d: '2026-11-16', sign: '−', amt: '42.50',    acc: 'Visa **23' },
  { I: Icon.arrowDown,c: C.pos,     desc: 'Nómina noviembre',     cat: 'Ingreso',         date: '15 nov · 09:00', d: '2026-11-15', sign: '+', amt: '3,200.00', acc: 'BBVA Cuenta' },
  { I: Icon.music,    c: C.purple,  desc: 'Spotify Family',       cat: 'Suscripciones',   date: '14 nov · 02:00', d: '2026-11-14', sign: '−', amt: '14.99',    acc: 'Visa **23' },
  { I: Icon.car,      c: C.warn,    desc: 'Uber — aeropuerto',    cat: 'Transporte',      date: '13 nov · 18:45', d: '2026-11-13', sign: '−', amt: '22.10',    acc: 'Visa **23' },
  { I: Icon.cards,    c: C.pink,    desc: 'Cuota préstamo coche', cat: 'Deudas',          date: '12 nov · 09:00', d: '2026-11-12', sign: '−', amt: '280.00',   acc: 'BBVA Cuenta' },
  { I: Icon.film,     c: C.primary, desc: 'Filmin',               cat: 'Entretenimiento', date: '11 nov · 21:18', d: '2026-11-11', sign: '−', amt: '7.99',     acc: 'Visa **23' },
  { I: Icon.arrowDown,c: C.pos,     desc: 'Freelance — proyecto X',cat: 'Ingreso',        date: '10 nov · 16:20', d: '2026-11-10', sign: '+', amt: '650.00',   acc: 'BBVA Cuenta' },
  { I: Icon.bag,      c: C.primary, desc: 'Zara',                 cat: 'Compras',         date: '09 nov · 19:14', d: '2026-11-09', sign: '−', amt: '128.90',   acc: 'Visa **23' },
  { I: Icon.utensils, c: C.neg,     desc: 'La Trastienda',        cat: 'Comida',          date: '08 nov · 21:42', d: '2026-11-08', sign: '−', amt: '64.50',    acc: 'Visa **23' },
  { I: Icon.house,    c: C.warn,    desc: 'IKEA',                 cat: 'Hogar',           date: '07 nov · 13:25', d: '2026-11-07', sign: '−', amt: '184.00',   acc: 'BBVA Débito' },
  { I: Icon.heart,    c: C.pos,     desc: 'Farmacia Sol',         cat: 'Salud',           date: '06 nov · 11:10', d: '2026-11-06', sign: '−', amt: '18.40',    acc: 'BBVA Débito' },
  { I: Icon.bag,      c: C.primary, desc: 'El Corte Inglés',      cat: 'Compras',         date: '05 nov · 16:55', d: '2026-11-05', sign: '−', amt: '92.00',    acc: 'Visa **23' },
  { I: Icon.music,    c: C.purple,  desc: 'YouTube Premium',      cat: 'Suscripciones',   date: '04 nov · 02:00', d: '2026-11-04', sign: '−', amt: '11.99',    acc: 'Visa **23' },
  { I: Icon.book,     c: C.cyan,    desc: 'Domestika curso',      cat: 'Educación',       date: '03 nov · 22:01', d: '2026-11-03', sign: '−', amt: '49.00',    acc: 'BBVA Débito' },
  { I: Icon.car,      c: C.warn,    desc: 'Metro Madrid',         cat: 'Transporte',      date: '02 nov · 08:14', d: '2026-11-02', sign: '−', amt: '21.60',    acc: 'BBVA Débito' },
  { I: Icon.utensils, c: C.neg,     desc: 'Glovo',                cat: 'Comida',          date: '01 nov · 20:51', d: '2026-11-01', sign: '−', amt: '28.30',    acc: 'Visa **23' },
];

export const CATS = ['Todas','Comida','Transporte','Compras','Suscripciones','Ingreso','Deudas','Hogar','Salud','Educación','Entretenimiento'];
export const ACCS = ['Todas','BBVA Cuenta','BBVA Débito','Visa **23'];

export interface Account {
  n: string;
  type: string;
  num: string;
  bal: number;
  delta: string;
  kind: 'pos' | 'neg';
  data: number[];
  brand: string;
  txCount: number;
}

export const ACCOUNTS: Account[] = [
  {
    n: 'BBVA Cuenta',  type: 'Cuenta corriente', num: '·· 2847',
    bal: 8420.30,  delta: '+S/ 520.30', kind: 'pos',
    data: [7100,7400,7200,7800,8100,7900,8200,8050,8300,8350,8420],
    brand: C.primary, txCount: 12,
  },
  {
    n: 'BBVA Débito',  type: 'Cuenta ahorro',    num: '·· 5193',
    bal: 3140.20,  delta: '+S/ 180.00', kind: 'pos',
    data: [2800,2850,2900,2950,3000,2960,3050,3080,3100,3120,3140],
    brand: C.olive,   txCount: 5,
  },
  {
    n: 'Visa **23',    type: 'Tarjeta crédito',  num: '·· 0023',
    bal: 1280.00,  delta: '−S/ 320.20', kind: 'neg',
    data: [900,950,1100,1050,1200,1180,1250,1320,1300,1290,1280],
    brand: '#1A3A6E', txCount: 7,
  },
];

export interface Goal {
  n: string;
  cur: number;
  tgt: number;
  c: string;
  dl: string;
  I: IconComponent;
  monthly: number;
  eta: string;
  note: string;
}

export const GOALS: Goal[] = [
  { n: 'Viaje a Japón',    cur: 2160, tgt: 3000,  c: C.primary, dl: 'mar 2027', I: Icon.flame,  monthly: 280, eta: '3 meses',  note: 'Aportación recomendada: S/ 280/mes' },
  { n: 'Fondo emergencia', cur: 4500, tgt: 10000, c: C.pos,     dl: 'dic 2027', I: Icon.heart,  monthly: 460, eta: '12 meses', note: 'Cubrirías 6 meses de gastos' },
  { n: 'Laptop nueva',     cur: 1320, tgt: 1500,  c: C.warn,    dl: 'ene 2027', I: Icon.book,   monthly: 90,  eta: '2 meses',  note: 'Casi lo tienes — 88% completado' },
  { n: 'Coche eléctrico',  cur: 280,  tgt: 8000,  c: C.primary, dl: 'dic 2028', I: Icon.car,    monthly: 320, eta: '24 meses', note: 'Recién empezado · meta a largo plazo' },
];

export const COMPLETED_GOALS = [
  { n: 'Bodas amigos 2026', amt: 1200, when: 'sep 2026' },
  { n: 'Reforma cocina',    amt: 4500, when: 'jun 2026' },
];
