const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanAnggota = sequelize.define(
  'LaporanAnggota',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idAnggota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_anggota',
    },
    idItem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_item',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'baik', 
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    penggantian: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checklist: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'laporan_anggota',
    timestamps: true,
    underscored: true,
  },
);

module.exports = LaporanAnggota;
