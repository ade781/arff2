const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanNonAnggota = sequelize.define(
  'LaporanNonAnggota',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idNonAnggota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_non_anggota',
    },
    idItem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_item',
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'laporan_non_anggota',
    timestamps: true,
    underscored: true,
  },
);

module.exports = LaporanNonAnggota;
