import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import MealPlanner from '../MealPlanner/MealPlanner';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Dashboard</h2>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger"
                >
                  Logout
                </button>
              </div>

              <div className="alert alert-success" role="alert">
                Welcome back, <strong>{user?.username}</strong>!
              </div>

              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title mb-3">Profile Information</h5>

                  <div className="mb-2">
                    <strong>Username:</strong>{' '}
                    <span>{user?.username}</span>
                  </div>

                  <div className="mb-2">
                    <strong>Email:</strong>{' '}
                    <span>{user?.email}</span>
                  </div>

                  <div className="mb-0">
                    <strong>Joined:</strong>{' '}
                    <span>{formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Meal Planner Section */}
      <div className="row justify-content-center mt-4">
        <div className="col-12">
          <MealPlanner />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
