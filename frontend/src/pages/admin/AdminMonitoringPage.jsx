import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import MonitoringLaporan from '../../components/inspection/MonitoringLaporan';

export default function AdminMonitoringPage() {
  const {
    laporanAnggota,
    laporanNonAnggota,
    loadingMonitoring,
    loadMonitoring,
  } = useOutletContext();
  const [filters, setFilters] = useState({
    status: '',
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  useEffect(() => {
    loadMonitoring(filters);
  }, [filters]);

  return (
    <div className="space-y-4">
      <MonitoringLaporan
        laporanAnggota={laporanAnggota}
        laporanNonAnggota={laporanNonAnggota}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => loadMonitoring(filters)}
        loading={loadingMonitoring}
      />
    </div>
  );
}
