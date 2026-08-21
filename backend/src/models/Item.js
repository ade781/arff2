const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define(
  'Item',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kodeItem: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'kode_item',
    },
    namaItem: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nama_item',
    },
    jenis: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'apar',
    },
    zona: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'A',
    },
    lokasi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    detailLokasi: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'detail_lokasi',
    },
    exp: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'aktif',
    },
  },
  {
    tableName: 'items',
    timestamps: true,
    paranoid: true, // Soft delete: data tidak langsung hilang saat dihapus
    underscored: true,
    indexes: [
      { fields: ['kode_item'], unique: true },
      { fields: ['zona'] },
      { fields: ['status'] },
      { fields: ['jenis'] },
      { fields: ['exp'] },
    ],
  },
);

module.exports = Item;
