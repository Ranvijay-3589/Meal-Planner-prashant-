import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import MealPlanner from '../MealPlanner/MealPlanner';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container">
          <span className="navbar-brand fw-bold">Meal Planner</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Hi, {user?.username}</span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <div
                  className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h3 className="mb-1">Welcome, {user?.username}!</h3>
                <p className="text-muted mb-0">Your meal planning dashboard</p>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Profile Information</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-4 text-muted">Username</div>
                  <div className="col-8 fw-medium">{user?.username}</div>
                </div>
                <hr />
                <div className="row mb-3">
                  <div className="col-4 text-muted">Email</div>
                  <div className="col-8 fw-medium">{user?.email}</div>
                </div>
                <hr />
                <div className="row mb-3">
                  <div className="col-4 text-muted">Joined</div>
                  <div className="col-8 fw-medium">{formatDate(user?.createdAt)}</div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-4 text-muted">Last Login</div>
                  <div className="col-8 fw-medium">{formatDate(user?.lastLogin)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Meal Planner Table */}
        <div className="row mt-4">
          <div className="col-12">
            <MealPlanner />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Are you sure you want to logout?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
