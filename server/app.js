require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const votingRoutes = require('./routes/votings');


const app = express();
app.options('*', cors());

app.use(cors({origin: 'http://localhost:3000',credentials: true,  methods: ['GET', 'POST', 'PUT', 'DELETE'],allowedHeaders: ['Content-Type', 'Authorization']})); // Разрешение CORS
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/votings', votingRoutes);
const path = require('path')
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.json());
app.use('/api/votings', require('./routes/votings'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
db.authenticate()
  .then(() => {
    console.log('База данных подключена');
    
    return db.sync({ alter: true });
    db.sync({ alter: true })
  })
  .then(() => {
    const PORT = process.env.PORT || 5001;
    
    app.get('/', (req, res) => {
      res.send('Сервер работает!');
    });
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка подключения к базе данных:', err);
  });