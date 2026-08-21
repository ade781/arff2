
function cleanQrCode(rawQr) {
  const trimmed = (rawQr || '').trim();
  return trimmed.startsWith('ARFF-YIA:')
    ? trimmed.replace('ARFF-YIA:', '').trim()
    : trimmed;
}

module.exports = { cleanQrCode };
