import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiZap } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="sv-footer-container">
      <div className="sv-footer-top-line" />

      <div className="sv-footer-grid">
        {/* 1. Brand Column */}
        <div>
          <div className="sv-footer-brand-title">
            <div style={{ background: 'var(--gradient-accent)', padding: '0.4rem', borderRadius: '10px', display: 'flex', color: '#fff' }}>
              <FiZap size={20} />
            </div>
            <span className="sv-gradient-text">SkillsVersa</span>
          </div>
          <div className="sv-footer-brand-tagline">"Exchange Skills, Grow Together"</div>
          <p className="sv-footer-brand-desc">
            A peer-to-peer platform where students trade skills instead of money. Connect, learn, teach, and level up together.
          </p>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h4 className="sv-footer-col-title">Quick Links</h4>
          <ul className="sv-footer-links">
            <li>
              <Link to="/" className="sv-footer-link">Home</Link>
            </li>
            <li>
              <Link to="/explore" className="sv-footer-link">Explore Skills</Link>
            </li>
            <li>
              <a href="#how-it-works" className="sv-footer-link" onClick={(e) => {
                e.preventDefault();
                document.querySelector('.sv-how-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>How It Works</a>
            </li>
            <li>
              <Link to="/leaderboard" className="sv-footer-link">Leaderboard</Link>
            </li>
            <li>
              <a href="#faq" className="sv-footer-link" onClick={(e) => {
                e.preventDefault();
                document.querySelector('.sv-faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>FAQ</a>
            </li>
          </ul>
        </div>

        {/* 3. Account */}
        <div>
          <h4 className="sv-footer-col-title">Account</h4>
          <ul className="sv-footer-links">
            <li>
              <Link to="/register" className="sv-footer-link">Sign Up</Link>
            </li>
            <li>
              <Link to="/login" className="sv-footer-link">Log In</Link>
            </li>
            <li>
              <Link to="/dashboard" className="sv-footer-link">Dashboard</Link>
            </li>
            <li>
              <Link to="/profile" className="sv-footer-link">My Profile</Link>
            </li>
            <li>
              <Link to="/messages" className="sv-footer-link">Messages</Link>
            </li>
          </ul>
        </div>

        {/* 4. Connect */}
        <div>
          <h4 className="sv-footer-col-title">Connect</h4>
          <div className="sv-social-links">
            <a href="https://github.com/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-social-icon" aria-label="GitHub">
              <FiGithub />
            </a>
            <a href="https://linkedin.com/in/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-social-icon" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href="https://x.com/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-social-icon" aria-label="Twitter">
              <FiTwitter />
            </a>
          </div>
          <div className="sv-footer-email">
            <FiMail />
            <span>hello@skillsversa.com</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sv-footer-bottom">
        <div>© 2026 SkillsVersa. All rights reserved.</div>
        <div className="sv-footer-author">
          Created with ❤️ by{' '}
          <a
            href="https://github.com/suyashhirekerur/"
            target="_blank"
            rel="noopener noreferrer"
            className="sv-author-link"
          >
            Suyash Hirekerur
          </a>
          <span className="sv-author-socials">
            {' ('}
            <a href="https://github.com/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-author-sublink">GitHub</a>
            {' • '}
            <a href="https://linkedin.com/in/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-author-sublink">LinkedIn</a>
            {' • '}
            <a href="https://x.com/suyashhirekerur/" target="_blank" rel="noopener noreferrer" className="sv-author-sublink">Twitter</a>
            {')'}
          </span>
        </div>
      </div>
    </footer>
  );
}
