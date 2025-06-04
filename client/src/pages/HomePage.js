import React,{useState,useEffect} from 'react';
import Header from '../components/Header';
import VotingCard from '../components/VotingCard';
import {useNavigate} from 'react-router-dom';

const HomePage=()=>{
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState('');
  const[votings,setVotings]=useState([]);
  const[username,setUsername]=useState('');
  const navigate=useNavigate();

  useEffect(()=>{
    const token=localStorage.getItem('token');
    if(!token){navigate('/auth');return;}

    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username||'Пользователь');
    }catch{}

    const load=async()=>{
      try{
        const res=await fetch('http://localhost:5000/api/votings/all');
        const data=await res.json();
        setVotings(Array.isArray(data)?data:[]);
      }catch(e){
        setError('Не удалось загрузить голосования');
      }finally{setLoading(false);}
    };
    load();
  },[navigate]);

  return(
    <>
      <Header username={username}/>
      <div className="container">
        <div className="welcome-banner">
          <div className="banner-avatar">{username[0]?.toUpperCase()}</div>
          <div>
            <div className="banner-username">{username}</div>
            <div className="banner-sub">Добро пожаловать в систему голосований</div>
          </div>
        </div>

        <h2 className="section-heading">Все голосования</h2>

        {/* список */}
        {loading?(
          <p>Загрузка…</p>
        ):error?(
          <p>{error}</p>
        ):(
          <div className="voting-list">
            {votings.map(v=>(
              <VotingCard key={v.id} voting={v}/>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
