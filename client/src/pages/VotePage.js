import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const VotePage = () => {
  const { id }      = useParams();
  const   navigate  = useNavigate();


  const [voting,   setVoting]        = useState(null); 
  const [loading,  setLoading]       = useState(true);
  const [error,    setError]         = useState('');
  const [selected, setSelected]      = useState(null);
  const [hasVoted, setHasVoted]      = useState(false);
  const [isOwner,  setIsOwner]       = useState(false);


  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1])).id;
    } catch {
      return null;
    }
  };

 
  const fetchVoting = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/votings/${id}`);
      if (!res.ok) throw new Error('Не удалось загрузить данные');
      const data = await res.json();
      setVoting(data);

     
      const me = getCurrentUserId();
      setIsOwner(Boolean(me && me === data.UserId));

     
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVoting(); }, [fetchVoting]);

  const handleVote = async () => {
    if (selected === null) {
      setError('Сначала выберите вариант ');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/votings/${id}/vote`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json',
           ...(token ? { Authorization: `Bearer ${token}` } : {})
         },
        body   : JSON.stringify({ optionIndex: selected })
      });
      if (res.status === 409) {
        setHasVoted(true);
        setError('Вы уже голосовали в этом опросе');
        return;
      }
      if (!res.ok) throw new Error('Ошибка при голосовании');
      const updated = await res.json();
      setVoting(updated);
      setHasVoted(true);
      setSelected(null);
    } catch (e) {
      console.error(e);
      setError('Не удалось отправить голос');
    }
  };

  const completeVoting = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`http://localhost:5000/api/votings/${id}/complete`, {
        method : 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      console.log('PATCH /complete status :', res.status);
      console.log('PATCH /complete body   :', text);
      if (!res.ok) throw new Error(text || `status ${res.status}`);
      setVoting(JSON.parse(text));   
      const data = await res.json();
      setVoting(data);                     
    } catch (e) {
      console.error(e)
      alert('Не удалось завершить голосование');
    }
  };


  const isCompleted  = voting?.completed === true;
  const totalVotes   = voting ? Object.values(voting.results || {}).reduce((s, n) => s + n, 0) : 0;
  const leadingVotes = voting ? Math.max(...Object.values(voting.results || { 0: 0 })) : 0;
  const leadingIdx   = voting
    ? Object.entries(voting.results || {}).findIndex(([, v]) => v === leadingVotes)
    : -1;


  if (loading) return <div className="container">Загрузка…</div>;
  if (error)   return <div className="vote-error"><p>{error}</p></div>;
  if (!voting) return null;

  return (
    <div className="container">
      <div className="vote-page-container">

        <h2 className="vote-page-title">{voting.title}</h2>
        {!!voting.description && (
          <p className="vote-page-description">{voting.description}</p>
        )}
        <p className="vote-page-author-info">
          Автор: {voting.User?.username || '—'}
        </p>

       
        {!isCompleted && !hasVoted && (
          <>
            <div className="vote-options">
              {voting.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`vote-button ${selected === idx ? 'selected' : ''}`}
                  onClick={() => { setSelected(idx); setError(''); }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              className="vote-page-button"
              onClick={handleVote}
              disabled={selected === null}
              style={{ marginTop: 20 }}
            >
              Проголосовать
            </button>
          </>
        )}

        {(isOwner || hasVoted || isCompleted) && (
          <div className="results-section">
            {isCompleted && (
              <h4 style={{ textAlign: 'center', marginBottom: 6 }}>
                Голосование завершено
              </h4>
            )}
            <h4 style={{ textAlign: 'center', marginBottom: 10 }}>
              Результаты
            </h4>

            {voting.options.map((opt, idx) => {
              const count   = voting.results?.[idx] || 0;
              const leading = count === leadingVotes && count !== 0;
              return (
                <div
                  key={idx}
                  className={`vote-info ${leading ? 'leading' : ''}`}
                >
                  <span>{opt}</span>
                  <span>{count}</span>
                </div>
              );
            })}

            <p className="total-votes">Всего {totalVotes} голосов</p>

            {!isCompleted && (hasVoted || isOwner) && (
              <button
              className="vote-page-button ghost"
              style={{ marginTop: 20 }}
               onClick={() => navigate(-1)}
               >
                Назад
               </button>
            )}
          </div>
        )}

        
        {isOwner && !isCompleted && (
          <button
            className="vote-page-button"
            style={{ marginTop: 25 }}
            onClick={completeVoting}
          >
            Завершить голосование
          </button>
        )}
      </div>
    </div>
  );
};

export default VotePage;
