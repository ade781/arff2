const sequelize = require('../config/database');
const Item = require('./Item');
const AnggotaArff = require('./AnggotaArff');
const NonAnggota = require('./NonAnggota');
const LaporanAnggota = require('./LaporanAnggota');
const LaporanNonAnggota = require('./LaporanNonAnggota');

AnggotaArff.hasMany(LaporanAnggota, { foreignKey: 'id_anggota', as: 'laporan' });
LaporanAnggota.belongsTo(AnggotaArff, { foreignKey: 'id_anggota', as: 'petugas' });

Item.hasMany(LaporanAnggota, { foreignKey: 'id_item', as: 'laporanAnggota' });
LaporanAnggota.belongsTo(Item, { foreignKey: 'id_item', as: 'item' });

NonAnggota.hasMany(LaporanNonAnggota, { foreignKey: 'id_non_anggota', as: 'laporan' });
LaporanNonAnggota.belongsTo(NonAnggota, { foreignKey: 'id_non_anggota', as: 'pelapor' });

Item.hasMany(LaporanNonAnggota, { foreignKey: 'id_item', as: 'laporanNonAnggota' });
LaporanNonAnggota.belongsTo(Item, { foreignKey: 'id_item', as: 'item' });

module.exports = {
  sequelize,
  Item,
  AnggotaArff,
  NonAnggota,
  LaporanAnggota,
  LaporanNonAnggota,
};
