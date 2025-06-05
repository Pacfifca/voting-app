const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

let sequelize

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: 
        process.env.DATABASE_URL.includes('sslmode=require')
        ? { require: true, rejectUnauthorized: false }
        : false,
      },
  });
}else{
  sequelize=new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
    }
  );
}



const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Voting = sequelize.define('Voting', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  options: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  results: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  votedUsers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  }
});

User.hasMany(Voting, { foreignKey: 'UserId' });
Voting.belongsTo(User, { foreignKey: 'UserId' });

sequelize
  .authenticate()
  .then(() => console.log('✅ база данных подключена'))
  .catch(err => console.error('❌ нет доступа к базе данных:', err));


module.exports = {
  db: sequelize,
  User,
  Voting
};
