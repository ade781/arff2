import React from 'react';

export default function RekapInspectionTable({
  groupedData,
  laporanMap,
  activeZona,
  selectedBulan,
  selectedRegu,
}) {
  return (
    <div className="space-y-4">

      <div className="border-b-2 border-gray-900 pb-3 text-center space-y-0.5">
        <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
          YOGYAKARTA INTERNATIONAL AIRPORT
        </p>
        <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-gray-900">
          DAFTAR INSPEKSI APAR & FIRE HYDRANT ZONA {activeZona}
        </h2>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-700 pt-1">
          <span>PERIODE: {selectedBulan}</span>
          <span>•</span>
          <span className="text-blue-700">{selectedRegu.toUpperCase()}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-gray-100 border-b-2 border-gray-300 text-gray-800 font-bold uppercase text-[10.5px]">
            <tr>
              <th className="px-2.5 py-2 text-center border-r border-gray-300 w-10">NO</th>
              <th className="px-2.5 py-2 border-r border-gray-300 whitespace-nowrap">NOMOR ZONA</th>
              <th className="px-3 py-2 border-r border-gray-300">LOKASI</th>
              <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">JENIS APAR</th>
              <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">UKURAN (Kg)</th>
              <th className="px-2 py-2 border-r border-gray-300 text-center w-12">JUMLAH</th>
              <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">IHB</th>
              <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">OHB</th>
              <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap bg-gray-50">
                KONDISI LALU
              </th>
              <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap bg-blue-50 text-blue-900">
                KONDISI BERJALAN
              </th>
              <th className="px-2.5 py-2 border-r border-gray-300 text-center whitespace-nowrap">
                TGL INSPEKSI
              </th>
              <th className="px-2.5 py-2 border-r border-gray-300 whitespace-nowrap">NAMA PEMERIKSA</th>
              <th className="px-2 py-2 border-r border-gray-300 text-center whitespace-nowrap">PARAF</th>
              <th className="px-3 py-2">KETERANGAN</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white text-[11px]">
            {Object.keys(groupedData).length > 0 ? (
              Object.keys(groupedData).map((gedungName) => {
                const lantaiObj = groupedData[gedungName];
                let rowCounter = 1;

                return (
                  <React.Fragment key={gedungName}>
                    {Object.keys(lantaiObj).map((lantaiName) => {
                      const itemsInLantai = lantaiObj[lantaiName];

                      return (
                        <React.Fragment key={`${gedungName}-${lantaiName}`}>

                          <tr className="bg-slate-100 font-bold text-gray-900 border-y border-gray-300">
                            <td colSpan={14} className="px-3 py-1.5 tracking-wide text-xs">
                              🏢 {gedungName.toUpperCase()} — ( {lantaiName.toUpperCase()} )
                            </td>
                          </tr>

                          {itemsInLantai.map((item) => {
                            const lap = laporanMap[item.kodeItem] || null;
                            const isApar = item.jenis === 'apar';
                            const isIhb =
                              !isApar &&
                              (item.tipeHydrant === 'IHB' || item.namaItem?.includes('IHB'));
                            const isOhb =
                              !isApar &&
                              (item.tipeHydrant === 'OHB' || item.namaItem?.includes('OHB'));

                            let badgeClass = 'text-gray-600 bg-gray-100';
                            let kondisiText = 'Siap Operasi';

                            if (lap) {
                              if (lap.status === 'rusak') {
                                badgeClass = 'bg-red-100 text-red-800 font-bold border border-red-200';
                                kondisiText = 'Rusak';
                              } else if (lap.status === 'perlu_perhatian') {
                                badgeClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-200';
                                kondisiText = 'Baik dengan catatan';
                              } else {
                                badgeClass = 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200';
                                kondisiText = isApar ? 'Siap Operasi' : 'Lengkap 1';
                              }
                            } else {
                              badgeClass = 'bg-gray-100 text-gray-500';
                              kondisiText = isApar ? 'Siap Operasi' : 'Lengkap 1';
                            }

                            return (
                              <tr key={item.id} className="hover:bg-blue-50/40 transition">
                                <td className="px-2.5 py-1.5 text-center font-mono text-gray-500 border-r border-gray-200">
                                  {rowCounter++}
                                </td>
                                <td className="px-2.5 py-1.5 font-mono font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                  {item.kodeItem}
                                </td>
                                <td className="px-3 py-1.5 text-gray-800 border-r border-gray-200 max-w-[220px] truncate" title={item.lokasi}>
                                  {item.lokasi}
                                </td>
                                <td className="px-2.5 py-1.5 text-center font-semibold text-gray-700 border-r border-gray-200">
                                  {isApar ? item.tipeMedia || 'DCP' : '-'}
                                </td>
                                <td className="px-2.5 py-1.5 text-center text-gray-700 border-r border-gray-200">
                                  {isApar ? item.ukuran || '-' : '-'}
                                </td>
                                <td className="px-2 py-1.5 text-center font-mono border-r border-gray-200">
                                  {item.jumlah || 1}
                                </td>
                                <td className="px-2 py-1.5 text-center font-bold border-r border-gray-200">
                                  {isIhb ? <span className="text-blue-700">v</span> : '-'}
                                </td>
                                <td className="px-2 py-1.5 text-center font-bold border-r border-gray-200">
                                  {isOhb ? <span className="text-blue-700">v</span> : '-'}
                                </td>
                                <td className="px-2.5 py-1.5 text-center text-gray-600 border-r border-gray-200 bg-gray-50/50">
                                  {isApar ? 'Siap Operasi' : 'Lengkap 1'}
                                </td>
                                <td className="px-2.5 py-1.5 text-center border-r border-gray-200">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badgeClass}`}>
                                    {kondisiText}
                                  </span>
                                </td>
                                <td className="px-2.5 py-1.5 text-center text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                  {lap?.createdAt
                                    ? new Date(lap.createdAt).toLocaleDateString('id-ID')
                                    : '-'}
                                </td>
                                <td className="px-2.5 py-1.5 text-gray-800 font-medium border-r border-gray-200 whitespace-nowrap">
                                  {lap?.petugas?.nama || '-'}
                                </td>
                                <td className="px-2 py-1.5 text-center border-r border-gray-200">
                                  {lap ? (
                                    <span className="text-emerald-700 font-bold text-[10px]">✓</span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-1.5 text-gray-600 max-w-[200px] truncate" title={lap?.keterangan || item.detailLokasi || ''}>
                                  {lap?.keterangan || item.detailLokasi || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data equipment di Zona {activeZona} yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
