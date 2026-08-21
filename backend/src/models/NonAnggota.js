const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NonAnggota = sequelize.define(
  'NonAnggota',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kontak: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: 'non_anggota',
    timestamps: true,
    underscored: true,
  },
);

module.exports = NonAnggota;
