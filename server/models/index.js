const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions:
    process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING,                 allowNull: false },
});

const Voting = sequelize.define('Voting', {
  title:       { type: DataTypes.STRING,  allowNull: false },
  description: DataTypes.TEXT,
  options:     { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
  results:     { type: DataTypes.JSONB,  allowNull: false, defaultValue: {} },
  completed:   { type: DataTypes.BOOLEAN, defaultValue: false },
  votedUsers:  { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
});

User.hasMany(Voting, { foreignKey: 'UserId' });
Voting.belongsTo(User, { foreignKey: 'UserId' });

sequelize.authenticate()
  .then(() => console.log('✅ База данных подключена'))
  .catch(err  => console.error('❌ Ошибка подключения к БД:', err));

module.exports = { db: sequelize, User, Voting };
