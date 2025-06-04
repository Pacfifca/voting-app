import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const CreateVotingPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('Пользователь');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch {
        setUsername('Пользователь');
      }
    }
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const filteredOptions = options.map(opt => opt.trim()).filter(opt => opt);

    if (filteredOptions.length < 2) {
      setMessage('❌ Добавьте минимум два варианта ответа');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/votings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, options })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Голосование создано!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(`❌ ${data.error || 'Ошибка создания голосования'}`);
      }
    } catch (err) {
      setMessage(`❌ Ошибка сети: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header username={username} />
      <div className="container">
        <div className="form-container">
          <h2>Создать голосование</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Варианты ответа</label>
              {options.map((opt, index) => (
                <div key={index} className="option-row">
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    placeholder={`Вариант ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)}>×</button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <button type="button" onClick={addOption} className="add-option-btn">+ Добавить</button>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
            {message && <p style={{ marginTop: '15px' }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVotingPage;
