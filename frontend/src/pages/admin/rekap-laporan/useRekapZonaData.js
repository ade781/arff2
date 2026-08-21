import { useEffect, useMemo, useState } from 'react';
import { laporanAnggotaService } from '../../../api/laporanAnggotaService';

export function useRekapZonaData({ items = [], activeZona, filterGedung, filterKondisi, searchTerm }) {
  const [laporanList, setLaporanList] = useState([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);

  // Load all laporan from database
  useEffect(() => {
    async function fetchLaporan() {
      setLoadingLaporan(true);
      try {
        const data = await laporanAnggotaService.getAllLaporan({ limit: 'all' });
        setLaporanList(data || []);
      } catch (err) {
        console.error('Gagal memuat data laporan:', err);
      } finally {
        setLoadingLaporan(false);
      }
    }
    fetchLaporan();
  }, []);

  // Map laporan by kodeItem for rapid lookup
  const laporanMap = useMemo(() => {
    const map = {};
    laporanList.forEach((lap) => {
      const code = lap.item?.kodeItem || lap.equipment?.kodeItem || lap.equipment?.kodeEquipment;
      if (code && !map[code]) {
        map[code] = lap;
      }
    });
    return map;
  }, [laporanList]);

  // Items untuk Zona aktif
  const zonaItems = useMemo(() => {
    return items.filter((it) => String(it.zona) === String(activeZona));
  }, [items, activeZona]);

  // List gedung unik di Zona aktif
  const gedungList = useMemo(() => {
    const set = new Set();
    zonaItems.forEach((it) => {
      if (it.gedung) set.add(it.gedung);
    });
    return Array.from(set).sort();
  }, [zonaItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return zonaItems.filter((item) => {
      const matchGedung = !filterGedung || item.gedung === filterGedung;
      const matchSearch =
        !searchTerm ||
        item.kodeItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gedung?.toLowerCase().includes(searchTerm.toLowerCase());

      const lap = laporanMap[item.kodeItem];
      let matchKondisi = true;
      if (filterKondisi === 'inspected') {
        matchKondisi = Boolean(lap);
      } else if (filterKondisi === 'uninspected') {
        matchKondisi = !lap;
      } else if (filterKondisi === 'problem') {
        matchKondisi = lap && (lap.status === 'perlu_perhatian' || lap.status === 'rusak');
      }

      return matchGedung && matchSearch && matchKondisi;
    });
  }, [zonaItems, filterGedung, searchTerm, filterKondisi, laporanMap]);

  // Kelompokkan equipment per Gedung -> Lantai
  const groupedData = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const g = item.gedung || 'Lainnya';
      const l = item.lantai || 'Lantai 1';

      if (!groups[g]) groups[g] = {};
      if (!groups[g][l]) groups[g][l] = [];
      groups[g][l].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Statistik Zona Aktif
  const stats = useMemo(() => {
    let inspectedCount = 0;
    let problemCount = 0;
    let readyCount = 0;

    zonaItems.forEach((item) => {
      const lap = laporanMap[item.kodeItem];
      if (lap) {
        inspectedCount++;
        if (lap.status === 'rusak' || lap.status === 'perlu_perhatian') {
          problemCount++;
        } else {
          readyCount++;
        }
      }
    });

    return {
      total: zonaItems.length,
      inspected: inspectedCount,
      ready: readyCount,
      problem: problemCount,
      percentage: zonaItems.length ? Math.round((inspectedCount / zonaItems.length) * 100) : 0,
    };
  }, [zonaItems, laporanMap]);

  return {
    laporanList,
    loadingLaporan,
    laporanMap,
    zonaItems,
    gedungList,
    filteredItems,
    groupedData,
    stats,
  };
}
