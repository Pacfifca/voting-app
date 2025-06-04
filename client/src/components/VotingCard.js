import React from 'react';
import {useNavigate} from 'react-router-dom';

const VotingCard=({voting})=>{
  const navigate=useNavigate();
  return(
    <div className="voting-card">
      <div className="voting-info">
        <h3 className="voting-title">{voting.title}</h3>
        {voting.description&&<p className="voting-desc">{voting.description}</p>}
        <span className="voting-meta">
          Создано: {voting.User?.username||'автор'} • {new Date(voting.createdAt).toLocaleDateString()}
        </span>
      </div>

      <button
        className="participate-btn"
        onClick={()=>navigate(`/voting/${voting.id}`)}>
        Участвовать
      </button>
    </div>
  );
};

export default VotingCard;