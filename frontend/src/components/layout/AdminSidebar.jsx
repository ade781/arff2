import React from 'react';
import { NavLink } from 'react-router-dom';
import { Boxes, FileSpreadsheet, History, LayoutDashboard, LogOut, QrCode } from 'lucide-react';

export default function AdminSidebar({
  session,
  onLogout,
  mobileOpen,
  onCloseMobile,
  itemsCount,
  laporanCount,
  aduanCount,
}) {
  const menuItems = [
    { to: '/admin', end: true, label: 'Ringkasan', icon: LayoutDashboard, badge: null },
    { to: '/admin/items', label: 'Master Equipment', icon: Boxes, badge: itemsCount },
    { to: '/admin/template-qr', label: 'Template QR (A4)', icon: QrCode, badge: null },
    { to: '/admin/rekap-laporan', label: 'Rekap Laporan Zona', icon: FileSpreadsheet, badge: null },
    { to: '/admin/monitoring', label: 'Monitoring & Aduan', icon: History, badge: (laporanCount + aduanCount) || null },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-white border-r border-gray-200 no-print">
      <div>
        <div className="pb-3 border-b border-gray-200">
          <h1 className="text-sm font-bold text-gray-900">ARFF YIA</h1>
          <p className="text-xs text-gray-500">Panel Admin</p>
        </div>

        <nav className="mt-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                className={({ isActive }) =>
                  `flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="mb-2 text-xs">
          <p className="font-semibold text-gray-900 truncate">{session?.user?.nama || 'Admin'}</p>
          <p className="text-gray-500 text-[11px]">{session?.user?.role || 'admin'}</p>
        </div>

        <button
          className="flex w-full items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={13} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-56 shrink-0 h-screen sticky top-0 no-print">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden no-print">
          <div className="fixed inset-0 bg-black/30" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      ) : null}
    </>
  );
}
