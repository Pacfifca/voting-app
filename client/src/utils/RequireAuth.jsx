import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  /* токен всё ещё в localStorage ? */
  const hasToken = Boolean(localStorage.getItem('token'));

  return hasToken ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default RequireAuth;