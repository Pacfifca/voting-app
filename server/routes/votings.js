const express = require('express');
const router = express.Router();
const { Voting, User } = require('../models');
const authMiddleware = require('../middlewares/auth');

router.get('/all', async (req, res) => {
  try {
    const votings = await Voting.findAll({
      include: {
        model: User,
        attributes: ['username']
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(votings);
  } catch (error) {
    console.error('Ошибка получения всех голосований:', error);
    res.status(500).json({ error: 'Failed to load all votings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const voting = await Voting.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ['username']
      }
    });

    if (!voting) return res.status(404).json({ error: 'Voting not found' });
    res.json(voting);
  } catch (err) {
    console.error('Ошибка получения голосования:', err);
    res.status(500).json({ error: 'Failed to fetch voting' });
  }
});


router.post('/:id/vote', async (req, res) => {
  try {
    const voting = await Voting.findByPk(req.params.id);
    if (!voting) return res.status(404).json({ error: 'Voting not found' });


    const token = req.headers.authorization?.split(' ')[1];
    if (!token)  return res.status(401).json({ error: 'Unauthorized' });
    const { id: userId } = JSON.parse(Buffer.from(token.split('.')[1], 'base64'));

    if (voting.votedUsers.includes(userId))
      return res.status(409).json({ error: 'You have already voted in this poll' });

    if (voting.completed)
      return res.status(400).json({ error: 'Voting is completed' });

    const { optionIndex } = req.body;
    if (
      typeof optionIndex !== 'number' ||
      optionIndex < 0 ||
      optionIndex >= voting.options.length
    ) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    const results = {
      ...(voting.results || {}),
      [optionIndex]: (voting.results?.[optionIndex] || 0) + 1,
    };
    const votedUsers = [...voting.votedUsers, userId];

    await voting.update({ results, votedUsers });           

    const fullVoting = await Voting.findByPk(req.params.id, {
      include: { model: User, attributes: ['username'] },
    });

    return res.json(fullVoting);
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});


router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const votings = await Voting.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(votings);
  } catch (error) {
    console.error('Ошибка получения голосований пользователя:', error);
    res.status(500).json({ error: 'Failed to get votings' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { title, description, options } = req.body;

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Minimum two options required' });
    }

    const results = {};
    options.forEach((_, idx) => {
      results[idx] = 0;
    });

    const voting = await Voting.create({
      title,
      description,
      options,
      results,
      UserId: req.user.id,
      completed: false,
      votedUsers: []
    });

    res.status(201).json(voting);
  } catch (error) {
    console.error('Ошибка создания голосования:', error);
    res.status(500).json({ error: 'Failed to create voting' });
  }
});


router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const voting = await Voting.findByPk(req.params.id);

    if (!voting) return res.status(404).json({ error: 'ГОЛОСОВАНИЕ НЕ НАЦДЕНО!' });
    if (voting.UserId !== req.user.id) return res.status(403).json({ error: 'ЭТО НЕ ВАШЕ ГОЛОСОВАНИЕ' });

    voting.completed = true;
    await voting.save();
    res.json(voting);
    const fullVoting = await Voting.findByPk(req.params.id);
    res.json(fullVoting);
  } catch (err) {
    console.error('Complete error:', err);
    res.status(500).json({ error: 'Failed to complete voting' });
  }
});
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const voting = await Voting.findByPk(req.params.id);
    if (!voting)                         return res.status(404).json({ error: 'Voting not found' });
    if (voting.UserId !== req.user.id)   return res.status(403).json({ error: 'You are not the owner' });
    if (voting.completed)                return res.status(400).json({ error: 'Voting already completed' });

    await voting.update({ completed: true });

    const fullVoting = await Voting.findByPk(req.params.id, {
      include: { model: User, attributes: ['username'] },
    });
    res.json(fullVoting);
  } catch (e) {
    console.error('Patch /complete error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
