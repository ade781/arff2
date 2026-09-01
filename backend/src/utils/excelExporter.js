const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const DOCS_DIR = path.join(__dirname, '../../../docs');

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseSharedStrings(xml) {
  const strings = [];
  const siRegex = /<si>([\s\S]*?)<\/si>/g;
  let match;
  while ((match = siRegex.exec(xml)) !== null) {
    const siContent = match[1];
    const tMatches = siContent.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
    const text = tMatches.map((t) => t.replace(/<t[^>]*>/, '').replace(/<\/t>/, '')).join('');
    strings.push(text);
  }
  return strings;
}

function setCellInRow(rowContent, colLetter, rowNum, val) {
  const cellRef = `${colLetter}${rowNum}`;

  // Match either self-closing tag: <c r="J6" s="12"/> OR paired tag: <c r="J6" ...>...</c>
  const cellRegex = new RegExp(`(<c r="${cellRef}"([^>]*?)(?:\\/>|>([\\s\\S]*?)<\\/c>))`);
  const match = rowContent.match(cellRegex);

  if (match) {
    const fullTag = match[1];
    const attrs = match[2];

    const sMatch = attrs.match(/s="([^"]+)"/);
    const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';

    const replacement = `<c r="${cellRef}"${sAttr} t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
    return rowContent.replace(fullTag, replacement);
  }

  const newCell = `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
  return rowContent + newCell;
}

async function exportHighFidelityZonaExcel({
  zona = '1',
  bulanTahun = 'AGUSTUS 2026',
  bulanLalu = 'JULI 2026',
  regu = 'REGU DELTA',
  laporanMap = {},
  petugasName = 'Petugas ARFF',
}) {
  const templateFileName = `ZONA ${zona}.xlsx`;
  const templatePath = path.join(DOCS_DIR, templateFileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`File template ${templateFileName} tidak ditemukan di folder docs`);
  }

  const templateBuffer = fs.readFileSync(templatePath);
  const zip = await JSZip.loadAsync(templateBuffer);

  let sharedStrings = [];
  const sstFile = zip.file('xl/sharedStrings.xml');
  if (sstFile) {
    const sstXml = await sstFile.async('text');
    sharedStrings = parseSharedStrings(sstXml);
  }

  const wbXml = await zip.file('xl/workbook.xml').async('text');
  const sheetMatches = [...wbXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)];
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels').async('text');
  const relMatches = {};
  for (const m of relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    relMatches[m[1]] = m[2];
  }

  const bulanLaluUpper = bulanLalu.split(' ')[0].toUpperCase();
  const bulanSekarangUpper = bulanTahun.split(' ')[0].toUpperCase();

  for (const match of sheetMatches) {
    const sheetName = match[1];
    const relId = match[2];
    const targetPath = relMatches[relId];
    if (!targetPath) continue;

    const fullSheetPath = targetPath.startsWith('/') ? targetPath.slice(1) : `xl/${targetPath}`;
    const sheetFile = zip.file(fullSheetPath);
    if (!sheetFile) continue;

    let sheetXml = await sheetFile.async('text');
    const isCover = sheetName.toUpperCase().includes('COVER');
    const isDenah = sheetName.toUpperCase().includes('DENAH');
    if (isDenah) continue;

    if (isCover) {
      // Set clean proportional row heights for title and bottom text (24pt font)
      sheetXml = sheetXml.replace(/<row r="([1-4])"([^>]*)>/g, (m, rNum, rAttrs) => {
        const cleanAttrs = rAttrs.replace(/\bht="[^"]*"\s*/g, '').replace(/\bcustomHeight="[^"]*"\s*/g, '').trim();
        const prefix = cleanAttrs ? ` ${cleanAttrs}` : '';
        return `<row r="${rNum}"${prefix} ht="34" customHeight="1">`;
      });
      sheetXml = sheetXml.replace(/<row r="(2[4-5])"([^>]*)>/g, (m, rNum, rAttrs) => {
        const cleanAttrs = rAttrs.replace(/\bht="[^"]*"\s*/g, '').replace(/\bcustomHeight="[^"]*"\s*/g, '').trim();
        const prefix = cleanAttrs ? ` ${cleanAttrs}` : '';
        return `<row r="${rNum}"${prefix} ht="34" customHeight="1">`;
      });

      sheetXml = sheetXml.replace(/(<c r="A3"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/, (full) => {
        const sMatch = full.match(/s="([^"]+)"/);
        const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';
        return `<c r="A3"${sAttr} t="inlineStr"><is><t>${escapeXml(regu.toUpperCase())}</t></is></c>`;
      });
      sheetXml = sheetXml.replace(/(<c r="A25"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/, (full) => {
        const sMatch = full.match(/s="([^"]+)"/);
        const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';
        return `<c r="A25"${sAttr} t="inlineStr"><is><t>${escapeXml(bulanTahun.toUpperCase())}</t></is></c>`;
      });
      zip.file(fullSheetPath, sheetXml);
      continue;
    }

    sheetXml = sheetXml.replace(/(<c r="A3"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/, (full) => {
      const sMatch = full.match(/s="([^"]+)"/);
      const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';
      return `<c r="A3"${sAttr} t="inlineStr"><is><t>${escapeXml(bulanTahun.toUpperCase())}</t></is></c>`;
    });

    sheetXml = sheetXml.replace(/(<c r="I4"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/, (full) => {
      const sMatch = full.match(/s="([^"]+)"/);
      const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';
      return `<c r="I4"${sAttr} t="inlineStr"><is><t>KONDISI&#10;${escapeXml(bulanLaluUpper)}</t></is></c>`;
    });

    sheetXml = sheetXml.replace(/(<c r="J4"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/, (full) => {
      const sMatch = full.match(/s="([^"]+)"/);
      const sAttr = sMatch ? ` s="${sMatch[1]}"` : '';
      return `<c r="J4"${sAttr} t="inlineStr"><is><t>KONDISI&#10;${escapeXml(bulanSekarangUpper)}</t></is></c>`;
    });

    const rowRegex = /<row r="(\d+)"([^>]*)>([\s\S]*?)<\/row>/g;
    sheetXml = sheetXml.replace(rowRegex, (fullRow, rowNumStr, rowAttrs, rowContent) => {
      const rowNum = parseInt(rowNumStr, 10);
      if (rowNum < 5) return fullRow;

      // Auto-calibrate legend table row heights at the bottom of the worksheet
      const legendCells = [...rowContent.matchAll(/<c r="[A-Z]+\d+"[^>]*t="s"[^>]*><v>(\d+)<\/v><\/c>/g)];
      let legendHeight = null;
      legendCells.forEach(([_, strIdx]) => {
        const s = sharedStrings[parseInt(strIdx, 10)];
        if (s) {
          if (s.includes('Baik dengan catatan') && (s.includes('peralatan') || s.includes('keterangan'))) {
            legendHeight = 46;
          } else if (s.includes('Low Pressure') || s.includes('Kosong / tidak ada') || s.includes('tidak diketahui')) {
            legendHeight = 30;
          } else if (s.includes('Siap Operasi (') || s.includes('Rusak (') || s.includes('Lengkap 1 (') || s.includes('Lengkap 2 (')) {
            legendHeight = 20;
          }
        }
      });

      let cleanRowAttrs = rowAttrs.replace(/\bht="[^"]*"\s*/g, '').replace(/\bcustomHeight="[^"]*"\s*/g, '').trim();
      let updatedRowAttrs = cleanRowAttrs ? ` ${cleanRowAttrs}` : '';
      if (legendHeight) {
        updatedRowAttrs += ` ht="${legendHeight}" customHeight="1"`;
      } else if (rowAttrs.includes('customHeight="1"')) {
        const origHt = rowAttrs.match(/\bht="([^"]+)"/);
        if (origHt) {
          updatedRowAttrs += ` ht="${origHt[1]}" customHeight="1"`;
        }
      }

      function getCellVal(colLetter) {
        const cellRegex = new RegExp(`<c r="${colLetter}${rowNum}"([^>]*?)(?:\\/>|>([\\s\\S]*?)<\\/c>)`);
        const cellMatch = rowContent.match(cellRegex);
        if (!cellMatch) return '';
        const attrs = cellMatch[1];
        const inner = cellMatch[2] || '';
        if (attrs.includes('t="s"')) {
          const vMatch = inner.match(/<v>(\d+)<\/v>/);
          if (vMatch) return sharedStrings[parseInt(vMatch[1], 10)] || '';
        } else if (attrs.includes('t="inlineStr"')) {
          const tMatch = inner.match(/<t[^>]*>(.*?)<\/t>/);
          if (tMatch) return tMatch[1];
        } else {
          const vMatch = inner.match(/<v>(.*?)<\/v>/);
          if (vMatch) return vMatch[1];
        }
        return '';
      }

      const colB = getCellVal('B');
      const colA = getCellVal('A');
      let kode = '';
      if (colB.match(/^[A-Z]\.\d+/i)) {
        kode = colB.trim();
      } else if (colA.match(/^[A-Z]\.\d+/i)) {
        kode = colA.trim();
      }

      if (!kode) {
        return `<row r="${rowNumStr}"${updatedRowAttrs}>${rowContent}</row>`;
      }

      const lap = laporanMap[kode];
      if (!lap) {
        return `<row r="${rowNumStr}"${updatedRowAttrs}>${rowContent}</row>`;
      }

      const colD = getCellVal('D');
      const colG = getCellVal('G');
      const isIhb = colG.toUpperCase() === 'V';

      let statusText = 'Siap Operasi';
      if (lap.status === 'rusak') {
        statusText = 'Rusak';
      } else if (lap.status === 'perlu_perhatian') {
        statusText = 'Baik dengan catatan';
      } else {
        statusText = colD ? 'Siap Operasi' : (isIhb ? 'Lengkap 1' : 'Lengkap 2');
      }

      const tglStr = new Date(lap.createdAt).toLocaleDateString('id-ID');
      const pemeriksa = lap.petugas?.nama || petugasName || 'Petugas ARFF';
      const paraf = '✓';
      const ket = lap.keterangan || '';

      let newRowContent = rowContent;
      newRowContent = setCellInRow(newRowContent, 'J', rowNum, statusText);
      newRowContent = setCellInRow(newRowContent, 'K', rowNum, tglStr);
      newRowContent = setCellInRow(newRowContent, 'L', rowNum, pemeriksa);
      newRowContent = setCellInRow(newRowContent, 'M', rowNum, paraf);
      if (ket) {
        newRowContent = setCellInRow(newRowContent, 'N', rowNum, ket);
      }

      return `<row r="${rowNumStr}"${updatedRowAttrs}>${newRowContent}</row>`;
    });

    zip.file(fullSheetPath, sheetXml);
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return buffer;
}

module.exports = {
  exportHighFidelityZonaExcel,
};
