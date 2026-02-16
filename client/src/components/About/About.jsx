import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function About() {
  const { token } = useAuth();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <h1 className="h3 mb-2">About Meal Planner</h1>
                <p className="text-muted">Plan your meals, simplify your life.</p>
              </div>

              <div className="mb-4">
                <h2 className="h5 mb-3">What is Meal Planner?</h2>
                <p>
                  Meal Planner is a simple and intuitive web application designed to help you
                  organize your weekly and daily meals. Whether you are looking to eat healthier,
                  save time on grocery shopping, or just bring more structure to your kitchen
                  routine, Meal Planner has you covered.
                </p>
              </div>

              <div className="mb-4">
                <h2 className="h5 mb-3">Features</h2>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0">
                    <span className="fw-semibold">Secure Authentication</span> &mdash; Your account
                    is protected with industry-standard password hashing and JWT-based sessions.
                  </li>
                  <li className="list-group-item px-0">
                    <span className="fw-semibold">Personal Dashboard</span> &mdash; View and manage
                    your profile information at a glance.
                  </li>
                  <li className="list-group-item px-0">
                    <span className="fw-semibold">Weekly &amp; Daily Plans</span> &mdash; Organize
                    meals by day to stay on track throughout the week.
                  </li>
                  <li className="list-group-item px-0">
                    <span className="fw-semibold">Easy to Use</span> &mdash; A clean, responsive
                    interface that works great on desktop and mobile.
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <h2 className="h5 mb-3">Tech Stack</h2>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-primary">React</span>
                  <span className="badge bg-success">Node.js</span>
                  <span className="badge bg-info text-dark">Express</span>
                  <span className="badge bg-secondary">PostgreSQL</span>
                  <span className="badge bg-dark">Bootstrap</span>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="h5 mb-3">Contact</h2>
                <p className="mb-0">
                  Have questions or feedback? Reach out to us
                  at <strong>support@mealplanner.com</strong>.
                </p>
              </div>

              <div className="text-center mt-4">
                {token ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/login" className="btn btn-primary">
                      Login
                    </Link>
                    <Link to="/register" className="btn btn-outline-primary">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
