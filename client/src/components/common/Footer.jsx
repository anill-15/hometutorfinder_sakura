import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { CITIES, SUBJECTS } from '../../utils/lookups.js';

/** Site footer with navigation and an honest note about the demo nature of the app. */
export default function Footer() {
  const year = new Date().getFullYear();
  const subjects = [...new Set(SUBJECTS)].length;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__note">
          <strong>Demo project.</strong> This is a college demo built with React and browser
          localStorage. There is no real backend, no payment processing and no email or SMS — all
          accounts, requests and reviews exist only in this browser and are cleared when you reset
          the demo data.
        </div>

        <div className="footer__grid">
          <div>
            <Link to="/" className="logo">
              <img className="logo__mark" src={logo} alt="" width="34" height="34" />
              <span>Home Tutor Finder</span>
            </Link>
            <p className="footer__about">
              A simple marketplace that helps students and parents find a suitable home tutor, and
              helps teachers find regular tuition work near them.
            </p>
          </div>

          <div>
            <h4 className="footer__title">For students</h4>
            <div className="footer__links">
              <Link className="footer__link" to="/tutors">Search tutors</Link>
              <Link className="footer__link" to="/requirements">Open requirements</Link>
              <Link className="footer__link" to="/register">Create an account</Link>
              <Link className="footer__link" to="/about">How it works</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">For tutors</h4>
            <div className="footer__links">
              <Link className="footer__link" to="/register">List your profile</Link>
              <Link className="footer__link" to="/requirements">Find tuition work</Link>
              <Link className="footer__link" to="/about">Why join</Link>
              <Link className="footer__link" to="/contact">Get in touch</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Platform</h4>
            <div className="footer__links">
              <Link className="footer__link" to="/about">About us</Link>
              <Link className="footer__link" to="/contact">Contact</Link>
              <span className="footer__link">{CITIES.length} cities</span>
              <span className="footer__link">{subjects} subjects</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Home Tutor Finder — college demo project.</span>
          <span>Built with React, React Router and Vite. Data stored in your browser.</span>
        </div>
      </div>
    </footer>
  );
}