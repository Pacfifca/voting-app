const { Voting, Option, Vote, User } = require('../models');


exports.createVoting = async (req, res) => {
  try {
    const { title, description, options } = req.body;
    const userId = req.user.id;
    
    if (!options || options.length < 2) {
      return res.status(400).json({ error: 'Добавьте как минимум 2 варианта' });
    }
    
    
    const voting = await Voting.create({
      title,
      description,
      userId
    });
    
    
    const createdOptions = await Promise.all(
      options.map(text => 
        Option.create({
          text,
          votingId: voting.id
        })
      )
    );
    
    res.status(201).json({
      ...voting.toJSON(),
      options: createdOptions
    });
  } catch (error) {
    console.error('Ошибка создания голосования:', error);
    res.status(500).json({ error: 'Ошибка создания голосования' });
  }
};

exports.getVoting = async (req, res) => {
  try {
    const voting = await Voting.findByPk(req.params.id, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'votes']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!voting) {
      return res.status(404).json({ error: 'Голосование не найдено' });
    }
    
    
    let userVoted = false;
    if (req.user) {
      const vote = await Vote.findOne({
        where: {
          userId: req.user.id,
          votingId: voting.id
        }
      });
      userVoted = !!vote;
    }
    
    
    const totalVotes = voting.options.reduce((sum, option) => sum + option.votes, 0);
    
    res.json({
      ...voting.toJSON(),
      totalVotes,
      userVoted
    });
  } catch (error) {
    console.error('Ошибка получения голосования:', error);
    res.status(500).json({ error: 'Ошибка получения голосования' });
  }
};


exports.vote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const userId = req.user.id;
    const votingId = req.params.id;
    
    const voting = await Voting.findByPk(votingId);
    if (!voting) {
      return res.status(404).json({ error: 'Голосование не найдено' });
    }
    
    const option = await Option.findOne({
      where: {
        id: optionId,
        votingId: votingId
      }
    });
    
    if (!option) {
      return res.status(400).json({ error: 'Неверный вариант ответа' });
    }
    

    const existingVote = await Vote.findOne({
      where: {
        userId: userId,
        votingId: votingId
      }
    });
    
    if (existingVote) {
      return res.status(400).json({ error: 'Вы уже проголосовали в этом голосовании' });
    }

    await Vote.create({
      userId,
      votingId,
      optionId
    });
    

    await option.update({
      votes: option.votes + 1
    });
    

    const updatedVoting = await Voting.findByPk(votingId, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'votes']
        }
      ]
    });
    

    const totalVotes = updatedVoting.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    res.json({
      ...updatedVoting.toJSON(),
      totalVotes,
      userVoted: true
    });
  } catch (error) {
    console.error('Ошибка при голосовании:', error);
    res.status(500).json({ error: 'Ошибка при голосовании' });
  }
};


exports.getUserVotings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const votings = await Voting.findAll({
      where: { userId },
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'votes']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(votings);
  } catch (error) {
    console.error('Ошибка получения голосований:', error);
    res.status(500).json({ error: 'Ошибка получения голосований' });
  }
};