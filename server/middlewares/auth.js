const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'Такой пользователь не найден):' });
    req.user = {
      id: user.id,
      username: user.username
    };

    next();
  } catch (error) {
    console.error('Ошибка верификации:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
