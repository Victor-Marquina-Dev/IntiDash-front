import { landingColors, landingRadius } from './theme';

const items = [
  { label: 'AES', text: 'Tokens sensibles cifrados' },
  { label: 'XLSX', text: 'Exportación Excel incluida' },
  { label: 'ROL', text: 'Workspaces con permisos' },
  { label: 'NO BANK', text: 'Sin pedir claves bancarias' },
];

export function TrustBanner() {
  return (
    <div
      className="py-7 border-y"
      style={{
        background: landingColors.fog,
        borderColor: 'rgba(23,25,28,0.07)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <ul className="flex flex-wrap items-center justify-center gap-3 list-none m-0 p-0">
          {items.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-2.5 border bg-white px-3 py-2 text-[14px]"
              style={{
                borderColor: 'rgba(23,25,28,0.07)',
                borderRadius: landingRadius.pill,
                color: landingColors.muted,
              }}
            >
              <span className="px-2 py-1 text-[10px] font-black" style={{ borderRadius: landingRadius.pill, background: landingColors.sky, color: landingColors.ink }}>
                {item.label}
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
