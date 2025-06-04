import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import VotingCard from '../components/VotingCard';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    username: '',
    createdAt: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }
        
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          username: tokenPayload.username,
          createdAt: new Date(tokenPayload.iat * 1000).toLocaleDateString()
        });
        
        const response = await fetch('http://localhost:5000/api/votings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        setVotings(data);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div>
      <Header username={userData.username} />
      
      <div className="container">
        <div className="profile-header" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'rgba(22, 33, 62, 0.5)',
          borderRadius: '10px'
        }}>
          <div className="user-avatar-large" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#5fa3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1a2e',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div>
            <h2 style={{ marginBottom: '10px' }}>{userData.username}</h2>
            <p style={{ color: '#bbbbbb' }}>
              Зарегистрирован: {userData.createdAt}
            </p>
          </div>
        </div>
        
        <h2 style={{ marginBottom: '20px' }}>Ваши голосования</h2>
        
        {votings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            backgroundColor: 'rgba(22, 33, 62, 0.5)',
            borderRadius: '10px'
          }}>
            <p style={{ marginBottom: '30px' }}>Вы ещё не создали ни одного голосования</p>
            <button 
              className="btn-primary"
              style={{ 
                padding: '15px 30px', 
                borderRadius: '30px',
                fontSize: '1.1rem',
                width: 'auto',
                margin: '0 auto'
              }}
              onClick={() => navigate('/create')}
            >
              Создать новое голосование
            </button>
          </div>
        ) : (
          <div className="voting-grid">
            {votings.map(voting => (
              <VotingCard key={voting.id} voting={voting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;