import { landingColors } from './theme';

const items = [
  { label: 'AES', text: 'Tokens sensibles cifrados' },
  { label: 'XLSX', text: 'Exportación Excel incluida' },
  { label: 'ROL', text: 'Workspaces con permisos' },
  { label: 'NO BANK', text: 'Sin pedir claves bancarias' },
];

export function TrustBanner() {
  return (
    <div
      className="py-6 border-y"
      style={{
        background: landingColors.paper,
        borderColor: 'rgba(10,46,34,0.06)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <ul className="flex flex-wrap items-center justify-center gap-5 list-none m-0 p-0">
          {items.map((item) => (
            <li key={item.text} className="flex items-center gap-2.5 text-[14px] text-[#5A6661]">
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#171C1A]">
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
