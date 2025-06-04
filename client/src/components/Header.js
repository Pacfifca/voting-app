import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';



const Header = ({ username = '' }) => {
  const navigate = useNavigate();

  const goProfile = () => navigate('/profile');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/auth', { replace: true });
  };

  return (
    <header className="header">
      <Link to = "/" className='logo-link'>
      <img src ="logo.svg" alt="Главная" className='logo-img'/>
      </Link>

      <div className="user-menu">
        <button
          className="btn-icon create-btn"
          onClick={() => navigate('/create')}
        >
          <FiPlus size={18} />
          Создать&nbsp;голосование
        </button>

        <button
          className="user-name-btn"
          type="button"
          onClick={goProfile}
          title="Профиль"
        >
          {username}
        </button>

        <button
          className="user-avatar"
          type="button"
          onClick={goProfile}
          title="Профиль"
        >
          {username.charAt(0).toUpperCase()}
        </button>

        <button
          className="btn-icon logout-btn big-logout"
          onClick={logout}
          title="Выйти"
        >
          <FiLogOut size={30} />
        </button>
      </div>
    </header>
  );
};

export default Header;
