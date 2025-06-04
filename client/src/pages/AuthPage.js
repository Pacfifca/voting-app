import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transition, setTransition] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);
  
  useEffect(() => {
    setTransition(true);
    const timer = setTimeout(() => {
      setTransition(false);
    }, 300);
    
    setFormData({ username: '', password: '' });
    setMessage('');
    
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const endpoint = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          setMessage(`✔ Вход выполнен! Добро пожаловать, ${formData.username}`);
          
        
          setTimeout(() => navigate('/'), 1000);
        } else {
          setMessage(`✔ Регистрация успешна! Теперь вы можете войти`);
          
          setTimeout(() => {
            setIsLogin(true);
          }, 1500);
        }
      } else {
        setMessage(` Ошибка: ${data.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      setMessage(` Ошибка сети: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className={`auth-card ${transition ? 'transitioning' : ''}`} ref={formRef}>
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? 'Добро пожаловать!' : 'Создайте аккаунт'}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? 'Войдите, чтобы продолжить' : 'Начните использовать платформу'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Имя пользователя"
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Пароль"
              minLength="8"
              className="auth-input"
            />
          </div>
          
          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : isLogin ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
          
          <div className="auth-switch">
            <button 
              type="button" 
              className="switch-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? (
                <>
                  Нет аккаунта? <span>Зарегистрироваться</span>
                </>
              ) : (
                <>
                  Уже есть аккаунт? <span>Войти</span>
                </>
              )}
            </button>
          </div>
          
          {message && (
            <div className={`auth-message ${message.includes('✔') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;