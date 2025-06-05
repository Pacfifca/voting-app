const { Sequelize, DataTypes } = require('sequelize');

const connectionString = process.env.DATABASE_URL; // Render её задаст
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,               // Render → always SSL
      rejectUnauthorized: false    // ok для Render
    }
  }
});



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
