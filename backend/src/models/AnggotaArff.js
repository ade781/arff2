const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnggotaArff = sequelize.define(
  'AnggotaArff',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ARFF YIA',
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'petugas', // 'admin' | 'petugas'
    },
  },
  {
    tableName: 'anggota_arff',
    timestamps: true,
    underscored: true,
  },
);

module.exports = AnggotaArff;
