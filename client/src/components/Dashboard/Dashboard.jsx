import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const joinedDate = useMemo(() => {
    if (!user?.created_at) {
      return 'N/A';
    }

    const date = new Date(user.created_at);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h1 className="h3 mb-1">Welcome to Meal Planner</h1>
                  <p className="text-muted mb-0">Your account details</p>
                </div>
                <div className="d-flex gap-2">
                  <Link to="/about" className="btn btn-outline-secondary">
                    About Us
                  </Link>
                  <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>

              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Username</span>
                  <span>{user?.username || 'N/A'}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Email</span>
                  <span>{user?.email || 'N/A'}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Joined</span>
                  <span>{joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
