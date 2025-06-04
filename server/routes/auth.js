const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const user = await User.create({ username, password: hashedPassword });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'ОШИБКА РЕГИСТРАЦИИ ОБРАТИТЕСЬ К АДМИНУ' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Пользователь не найден):' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Неправильный пароль):' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'ОШИБКА ВХОДА - ОБРАТИТЕСЬ К АДМИНУ' });
  }
});

module.exports = router;
