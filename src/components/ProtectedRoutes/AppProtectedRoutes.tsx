import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from '../context/tokenContext';

export default function AppProtectedRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = useContext(TokenContext);
  const token = ctx?.token ?? null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/auth', { replace: true });
  }, [token, navigate]);

  return <>{children}</>;
}
