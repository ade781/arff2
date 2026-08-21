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
      type: DataTypes.STRING(150),
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
      defaultValue: '1',
    },
    gedung: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lantai: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    tipeMedia: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'tipe_media', 
    },
    ukuran: {
      type: DataTypes.STRING(30),
      allowNull: true, 
    },
    tipeHydrant: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'tipe_hydrant', 
    },
    merk: {
      type: DataTypes.STRING(50),
      allowNull: true, 
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['kode_item'], unique: true },
      { fields: ['zona'] },
      { fields: ['gedung'] },
      { fields: ['jenis'] },
      { fields: ['status'] },
      { fields: ['exp'] },
    ],
  },
);

module.exports = Item;
