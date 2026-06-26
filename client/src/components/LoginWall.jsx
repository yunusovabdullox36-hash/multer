import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/Auth.css';

export default function LoginWall({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
