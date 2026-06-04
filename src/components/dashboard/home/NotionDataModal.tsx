'use client';

import React from 'react';
import { C } from '@/lib/colors';
import { formatNotionDate } from '@/lib/format';

const fmtFecha = formatNotionDate;
export interface NSIng  { id:string; nombre:string; ingreso:number|null; categoriaIngreso:string; cuentaBancaria:string; fecha:string|null }
export interface NSGasU { id:string; nombre:string; categoriaGasto:string; cuentaBancaria:string; monto:number|null; fecha:string|null }
export interface NSGasD { id:string; nombre:string; categoriaGasto:string; cuentaBancaria:string; montoGastado:number|null; cualDeuda:string; fecha:string|null }
export interface NSDeu  { id:string; nombre:string; estado:string; cantidad:number|null; ciclo:string; tipoPago:string; cuotasPendientes:number|null }
export interface NSCta  { id:string; nombre:string; tipo:string; banco:string; moneda:string; saldo:number|null; estado:string }
export interface NSTrf  { id:string; nombre:string; monto:number|null; cuentaOrigen:string; cuentaDestino:string; fecha:string|null }
export interface NSCat  { id:string; nombre:string; tipo:string }
export interface NSPre  { id:string; nombre:string; montoPrestamo:number|null; cuentaBancaria:string; montoPagado:number|null; cantidadFaltante:number|null; fecha:string|null }
export type NSTab = 'ing'|'gu'|'gd'|'deu'|'cta'|'tr'|'cg'|'ci'|'pr';
interface NotionDataModalProps {
  totalRec: number;
  dataLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  ingresos: NSIng[];
  gastosU: NSGasU[];
  gastosD: NSGasD[];
  deudas: NSDeu[];
  cuentas: NSCta[];
  transf: NSTrf[];
  catGastos: NSCat[];
  catIngreso: NSCat[];
  prestamos: NSPre[];
}

export function NotionDataModal({
  totalRec,
  dataLoading,
  onClose,
  onRefresh,
  ingresos,
  gastosU,
  gastosD,
  deudas,
  cuentas,
  transf,
  catGastos,
  catIngreso,
  prestamos,
}: NotionDataModalProps) {
  const [dataTab, setDataTab] = React.useState<NSTab>('ing');

  const TABS: { id:NSTab; label:string; count:number }[] = [
    { id:'ing', label:'Ingresos',       count:ingresos.length   },
    { id:'gu',  label:'Gastos Únicos',  count:gastosU.length    },
    { id:'gd',  label:'Gastos Deudas',  count:gastosD.length    },
    { id:'deu', label:'Deudas/Suscr.',  count:deudas.length     },
    { id:'cta', label:'Cuentas Banc.',  count:cuentas.length    },
    { id:'tr',  label:'Transferencias', count:transf.length     },
    { id:'cg',  label:'Cat. Gastos',    count:catGastos.length  },
    { id:'ci',  label:'Cat. Ingreso',   count:catIngreso.length },
    { id:'pr',  label:'Préstamos',      count:prestamos.length  },
  ];

  const thS: React.CSSProperties = {
    padding:'9px 14px', textAlign:'left', fontSize:10.5, fontWeight:700,
    color:C.textDim, textTransform:'uppercase', letterSpacing:0.8,
    background:'rgba(63,86,28,0.04)', borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap',
  };
  const tdB = (i:number, len:number): React.CSSProperties => ({
    padding:'10px 14px', borderBottom: i < len-1 ? `1px solid ${C.border}` : 'none',
  });
  const emptyRow = (cols:number) => (
    <tr><td colSpan={cols} style={{ padding:'20px 14px', textAlign:'center', color:C.textMute, fontSize:13 }}>Sin datos. Sincroniza primero.</td></tr>
  );
  const fmtS = (n:number|null) => n != null ? `S/ ${n.toLocaleString('es-PE',{minimumFractionDigits:2})}` : '-';

  return (
        <div
          style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e => { if (e.target===e.currentTarget) onClose(); }}
        >
          <div style={{ background:C.card, borderRadius:16, width:'100%', maxWidth:940, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.28)' }}>

            {/* Cabecera */}
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>Datos sincronizados</div>
                <div style={{ fontSize:12, color:C.textMute, marginTop:2 }}>{totalRec} registros totales</div>
              </div>
              <button
                onClick={onRefresh} disabled={dataLoading}
                style={{ background:'none', border:'none', cursor:dataLoading?'default':'pointer', color:C.textMute, fontSize:12, fontFamily:'var(--font-ui)', padding:'4px 8px' }}
              >{dataLoading?'Actualizando...':'Actualizar'}</button>
              <button
                onClick={() => onClose()}
                aria-label="Cerrar datos sincronizados"
                style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, cursor:'pointer', display:'grid', placeItems:'center', color:C.textDim, fontSize:18, fontWeight:300, lineHeight:1 }}
              >×</button>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', overflowX:'auto', borderBottom:`1px solid ${C.border}`, padding:'0 20px', flexShrink:0 }}>
              {TABS.map(t => {
                const act = dataTab===t.id;
                return (
                  <button key={t.id} onClick={() => setDataTab(t.id)} style={{
                    padding:'9px 14px', border:'none', background:'none', cursor:'pointer',
                    fontFamily:'var(--font-ui)', fontSize:13, fontWeight:act?600:400,
                    color:act?C.text:C.textMute, whiteSpace:'nowrap',
                    borderBottom:`2px solid ${act?C.olive:'transparent'}`, marginBottom:-1,
                  }}>
                    {t.label}
                    <span style={{ marginLeft:5, fontSize:10.5, background:`${C.olive}18`, color:C.olive, borderRadius:10, padding:'1px 6px', fontWeight:600 }}>{t.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido */}
            <div style={{ flex:1, overflow:'auto', padding:20 }}>
              {dataLoading ? (
                <div style={{ padding:'40px 0', textAlign:'center', color:C.textMute, fontSize:13 }}>Cargando datos...</div>
              ) : (
                <>
                  {dataTab==='ing' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Ingreso','Categoría','Cuenta Bancaria','Fecha'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {ingresos.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,ingresos.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,ingresos.length), color:C.pos, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{fmtS(r.ingreso)}</td>
                              <td style={{...tdB(i,ingresos.length), color:C.textDim}}>{r.categoriaIngreso||'-'}</td>
                              <td style={{...tdB(i,ingresos.length), color:C.textDim}}>{r.cuentaBancaria||'-'}</td>
                              <td style={{...tdB(i,ingresos.length), color:C.textMute, whiteSpace:'nowrap'}}>{fmtFecha(r.fecha)}</td>
                            </tr>
                          ))}
                          {ingresos.length===0 && emptyRow(5)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='gu' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Categoría','Cuenta Bancaria','Monto','Fecha'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {gastosU.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,gastosU.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,gastosU.length), color:C.textDim}}>{r.categoriaGasto||'-'}</td>
                              <td style={{...tdB(i,gastosU.length), color:C.textDim}}>{r.cuentaBancaria||'-'}</td>
                              <td style={{...tdB(i,gastosU.length), color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{fmtS(r.monto)}</td>
                              <td style={{...tdB(i,gastosU.length), color:C.textMute, whiteSpace:'nowrap'}}>{fmtFecha(r.fecha)}</td>
                            </tr>
                          ))}
                          {gastosU.length===0 && emptyRow(5)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='gd' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Categoría','Cuenta','Monto Gastado','¿Cuál deuda?','Fecha'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {gastosD.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,gastosD.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,gastosD.length), color:C.textDim}}>{r.categoriaGasto||'-'}</td>
                              <td style={{...tdB(i,gastosD.length), color:C.textDim}}>{r.cuentaBancaria||'-'}</td>
                              <td style={{...tdB(i,gastosD.length), color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{fmtS(r.montoGastado)}</td>
                              <td style={{...tdB(i,gastosD.length), color:C.textDim}}>{r.cualDeuda||'-'}</td>
                              <td style={{...tdB(i,gastosD.length), color:C.textMute, whiteSpace:'nowrap'}}>{fmtFecha(r.fecha)}</td>
                            </tr>
                          ))}
                          {gastosD.length===0 && emptyRow(6)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='deu' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Estado','Cantidad','Ciclo','Tipo Pago','Cuotas Pend.'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {deudas.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,deudas.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,deudas.length), color:C.textDim, maxWidth:180}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.estado||'-'}</span></td>
                              <td style={{...tdB(i,deudas.length), color:C.neg, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{fmtS(r.cantidad)}</td>
                              <td style={{...tdB(i,deudas.length), color:C.textDim}}>{r.ciclo||'-'}</td>
                              <td style={{...tdB(i,deudas.length), color:C.textDim}}>{r.tipoPago||'-'}</td>
                              <td style={{...tdB(i,deudas.length), color:(r.cuotasPendientes??0)>0?C.warn:C.pos, fontWeight:700, textAlign:'center'}}>{r.cuotasPendientes??'-'}</td>
                            </tr>
                          ))}
                          {deudas.length===0 && emptyRow(6)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='cta' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Tipo','Banco','Moneda','Saldo','Estado'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {cuentas.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,cuentas.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,cuentas.length), color:C.textDim}}>{r.tipo||'-'}</td>
                              <td style={{...tdB(i,cuentas.length), color:C.textDim}}>{r.banco||'-'}</td>
                              <td style={{...tdB(i,cuentas.length), color:C.textDim}}>{r.moneda||'-'}</td>
                              <td style={{...tdB(i,cuentas.length), color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{fmtS(r.saldo)}</td>
                              <td style={{...tdB(i,cuentas.length), color:C.textDim}}>{r.estado||'-'}</td>
                            </tr>
                          ))}
                          {cuentas.length===0 && emptyRow(6)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='tr' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Monto','Origen','Destino','Fecha'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {transf.map((r,i) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,transf.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,transf.length), color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{fmtS(r.monto)}</td>
                              <td style={{...tdB(i,transf.length), color:C.textDim}}>{r.cuentaOrigen||'-'}</td>
                              <td style={{...tdB(i,transf.length), color:C.textDim}}>{r.cuentaDestino||'-'}</td>
                              <td style={{...tdB(i,transf.length), color:C.textMute, whiteSpace:'nowrap'}}>{fmtFecha(r.fecha)}</td>
                            </tr>
                          ))}
                          {transf.length===0 && emptyRow(5)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(dataTab==='cg'||dataTab==='ci') && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Tipo'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {(dataTab==='cg'?catGastos:catIngreso).map((r,i,arr) => (
                            <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                              <td style={{...tdB(i,arr.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                              <td style={{...tdB(i,arr.length), color:C.textDim}}>{r.tipo||'-'}</td>
                            </tr>
                          ))}
                          {(dataTab==='cg'?catGastos:catIngreso).length===0 && emptyRow(2)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {dataTab==='pr' && (
                    <div style={{ overflowX:'auto', borderRadius:10, border:`1px solid ${C.border}` }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr>{['Nombre','Monto Prestado','Cuenta','Fecha','Monto Pagado','Faltante'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
                        <tbody>
                          {prestamos.map((r,i) => {
                            const falt = r.cantidadFaltante ?? ((r.montoPrestamo??0)-(r.montoPagado??0));
                            return (
                              <tr key={r.id} style={{ background:i%2===0?'#fff':'rgba(63,86,28,0.015)' }}>
                                <td style={{...tdB(i,prestamos.length), fontWeight:600, color:C.text}}>{r.nombre||'-'}</td>
                                <td style={{...tdB(i,prestamos.length), color:C.text, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{fmtS(r.montoPrestamo)}</td>
                                <td style={{...tdB(i,prestamos.length), color:C.textDim}}>{r.cuentaBancaria||'-'}</td>
                                <td style={{...tdB(i,prestamos.length), color:C.textMute, whiteSpace:'nowrap'}}>{fmtFecha(r.fecha)}</td>
                                <td style={{...tdB(i,prestamos.length), color:C.pos, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{fmtS(r.montoPagado)}</td>
                                <td style={{...tdB(i,prestamos.length), color:falt>0?C.neg:C.pos, fontWeight:600, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>S/ {falt.toLocaleString('es-PE',{minimumFractionDigits:2})}</td>
                              </tr>
                            );
                          })}
                          {prestamos.length===0 && emptyRow(6)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
  );
}
