import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {

  FiArrowRight,
  FiCompass,
  FiUser,
  FiSearch,
  FiVideo,
  FiDollarSign,
  FiTarget,
  FiMessageSquare,
  FiStar,
  FiAward,
  FiShield,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail
} from 'react-icons/fi';
import { HiSparkles, HiFire } from 'react-icons/hi';
import { BsQuote } from 'react-icons/bs';

import './Home.css';

// Intersection Observer Hook for Smooth Scroll Animations
function useScrollObserver() {
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const animElements = document.querySelectorAll('.sv-fade-in, .sv-stagger');

    animElements.forEach((el) => observer.observe(el));

    return () => {
      animElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
}

// Stats Counter Hook
function useCounter(targetNumber, isFloat = false) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000; // 2s duration
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = targetNumber / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= targetNumber) {
              setCount(targetNumber);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [targetNumber, hasAnimated]);

  return { ref, displayValue: isFloat ? count.toFixed(1) : Math.floor(count).toLocaleString() };
}

export default function Home() {
  useScrollObserver();

  // Stats Counters
  const userStat = useCounter(500);
  const sessionStat = useCounter(1200);
  const skillStat = useCounter(50);
  const ratingStat = useCounter(4.8, true);

  // Testimonials Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "I taught Python to a design student and learned Photoshop in return. No money exchanged, just pure knowledge sharing. This platform is genius!",
      name: "Aarav K.",
      exchange: "Python ↔ Photoshop",
      avatar: "AK",
      rating: 5
    },
    {
      quote: "As a music student, I never thought I'd learn React. But I traded guitar lessons for coding sessions and now I'm building my own portfolio site!",
      name: "Priya M.",
      exchange: "Guitar ↔ React",
      avatar: "PM",
      rating: 5
    },
    {
      quote: "The credit system is so smart. I earned credits by teaching Excel to 5 students, then used them to learn public speaking from a communications major.",
      name: "Vikram S.",
      exchange: "Excel ↔ Public Speaking",
      avatar: "VS",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0); // First item open by default

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Is SkillsVersa really free?",
      answer: "Yes! SkillsVersa is 100% free. There are no hidden fees, subscriptions, or premium plans. You exchange skills using our internal credit system — and you start with 50 free credits on signup."
    },
    {
      question: "How does the credit system work?",
      answer: "You earn credits by teaching sessions and spend credits to learn. Each session costs 10 credits by default. If you do a mutual exchange (you teach them + they teach you), no credits are spent at all!"
    },
    {
      question: "What if someone cancels a session?",
      answer: "If a session is cancelled, any credits that were held are automatically refunded. Our dual-confirmation system ensures both parties agree before a session is marked complete."
    },
    {
      question: "How does skill matching work?",
      answer: "Our smart algorithm finds users whose teaching skills match your learning goals, and vice versa. It considers skill overlap, ratings, availability, and credit balance to suggest the best matches."
    },
    {
      question: "Can I exchange any skill?",
      answer: "Absolutely! From programming and design to music, languages, cooking, fitness — any skill you can teach, you can exchange. We have 50+ skill categories and growing."
    },
    {
      question: "Is my data safe?",
      answer: "Yes. We use JWT-based authentication, encrypted passwords with bcrypt, and secure MongoDB storage. Your personal information is never shared with third parties."
    },
    {
      question: "What if I'm a beginner? Can I still teach?",
      answer: "Of course! Everyone has something to teach. You might be a Python beginner but an Excel expert. List what you're confident in, and let the matching algorithm do the rest."
    }
  ];

  return (
    <div className="sv-landing">
      {/* ==========================================
          SECTION 1 — Hero Section
         ========================================== */}
      <section className="sv-hero">
        <div className="sv-hero-bg-blob sv-blob-1" />
        <div className="sv-hero-bg-blob sv-blob-2" />

        <div className="sv-hero-content sv-fade-in">
          <div className="sv-hero-tagline">
            <HiSparkles />
            <span>No Money. Just Skills.</span>
          </div>

          <h1 className="sv-hero-heading">
            Exchange Skills, <br />
            <span className="sv-gradient-text">Grow Together</span>
          </h1>

          <p className="sv-hero-subheading">
            Join a community of students who trade what they know for what they want to learn.
            Teach Python, learn Guitar. Teach Design, learn Public Speaking. The possibilities are endless.
          </p>

          <div className="sv-hero-cta">
            <Link to="/register" className="sv-btn-primary">
              <span>Get Started — It's Free</span>
              <FiArrowRight />
            </Link>
            <Link to="/explore" className="sv-btn-secondary">
              <FiCompass />
              <span>Explore Skills</span>
            </Link>
          </div>

          <div className="sv-hero-trust">
            <span>✨ Join 500+ students already exchanging skills</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2 — Platform Stats Bar
         ========================================== */}
      <section className="sv-stats-section sv-fade-in">
        <div className="sv-glass-card sv-stats-bar">
          <div className="sv-stat-item" ref={userStat.ref}>
            <div className="sv-stat-number sv-gradient-text">{userStat.displayValue}+</div>
            <div className="sv-stat-label">Active Users</div>
          </div>
          <div className="sv-stat-item" ref={sessionStat.ref}>
            <div className="sv-stat-number sv-gradient-text">{sessionStat.displayValue}+</div>
            <div className="sv-stat-label">Sessions Completed</div>
          </div>
          <div className="sv-stat-item" ref={skillStat.ref}>
            <div className="sv-stat-number sv-gradient-text">{skillStat.displayValue}+</div>
            <div className="sv-stat-label">Skills Available</div>
          </div>
          <div className="sv-stat-item" ref={ratingStat.ref}>
            <div className="sv-stat-number sv-gradient-text">{ratingStat.displayValue} ★</div>
            <div className="sv-stat-label">Average Rating</div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 3 — How It Works
         ========================================== */}
      <section className="sv-how-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Simple Process</div>
          <h2>How It Works</h2>
          <p>Start exchanging skills in 3 simple steps</p>
        </div>

        <div className="sv-steps-grid sv-stagger">
          <div className="sv-glass-card sv-step-card">
            <div className="sv-step-badge">1</div>
            <div className="sv-step-icon">
              <FiUser />
            </div>
            <h3 className="sv-step-title">Create Your Skill Profile</h3>
            <p className="sv-step-desc">
              Sign up and list the skills you can teach and the ones you want to learn. Add your proficiency level and availability.
            </p>
          </div>

          <div className="sv-glass-card sv-step-card">
            <div className="sv-step-badge">2</div>
            <div className="sv-step-icon">
              <FiSearch />
            </div>
            <h3 className="sv-step-title">Find Your Perfect Match</h3>
            <p className="sv-step-desc">
              Our smart matching algorithm finds students whose skills complement yours. Python for Photoshop? Guitar for React? We'll find your match.
            </p>
          </div>

          <div className="sv-glass-card sv-step-card">
            <div className="sv-step-badge">3</div>
            <div className="sv-step-icon">
              <FiVideo />
            </div>
            <h3 className="sv-step-title">Exchange & Grow</h3>
            <p className="sv-step-desc">
              Schedule a session, exchange skills over video call or in person, and leave a review. Earn credits to learn even more.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4 — Trending Skills
         ========================================== */}
      <section className="sv-trending-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Popular Right Now</div>
          <h2>Trending Skills Right Now</h2>
          <p>See what students are exchanging this week</p>
        </div>

        <div className="sv-pills-wrapper sv-stagger">
          <span className="sv-skill-pill hot-pill">
            🐍 Python <HiFire className="sv-fire-icon" />
          </span>
          <span className="sv-skill-pill hot-pill">
            ⚛️ React <HiFire className="sv-fire-icon" />
          </span>
          <span className="sv-skill-pill hot-pill">
            🎸 Guitar <HiFire className="sv-fire-icon" />
          </span>
          <span className="sv-skill-pill">🎨 Photoshop</span>
          <span className="sv-skill-pill">📊 Excel</span>
          <span className="sv-skill-pill">🗣️ Public Speaking</span>
          <span className="sv-skill-pill">🎬 Video Editing</span>
          <span className="sv-skill-pill">📱 Flutter</span>
          <span className="sv-skill-pill">🧮 Data Science</span>
          <span className="sv-skill-pill">✍️ Content Writing</span>
          <span className="sv-skill-pill">🎹 Piano</span>
          <span className="sv-skill-pill">💼 Resume Building</span>
          <span className="sv-skill-pill">🌐 Web Development</span>
          <span className="sv-skill-pill">🗣️ Spanish</span>
          <span className="sv-skill-pill">📸 Photography</span>
          <span className="sv-skill-pill">🧠 Machine Learning</span>
          <span className="sv-skill-pill">🏋️ Fitness Training</span>
        </div>
      </section>

      {/* ==========================================
          SECTION 5 — Why SkillsVersa?
         ========================================== */}
      <section className="sv-why-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Key Benefits</div>
          <h2>Why Choose SkillsVersa?</h2>
          <p>Everything you need to learn and teach without spending a dime</p>
        </div>

        <div className="sv-features-grid sv-stagger">
          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiDollarSign />
            </div>
            <h3 className="sv-feature-title">No Money Needed</h3>
            <p className="sv-feature-desc">
              Trade skills directly with other students. No tutors, no fees, no subscriptions. Your knowledge is your currency.
            </p>
          </div>

          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiTarget />
            </div>
            <h3 className="sv-feature-title">Smart Skill Matching</h3>
            <p className="sv-feature-desc">
              Our algorithm analyzes your skills and finds the perfect exchange partners based on what you teach and what you want to learn.
            </p>
          </div>

          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiMessageSquare />
            </div>
            <h3 className="sv-feature-title">Real-time Messaging</h3>
            <p className="sv-feature-desc">
              Chat with your skill partners instantly. Discuss session details, share resources, and coordinate schedules in real-time.
            </p>
          </div>

          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiStar />
            </div>
            <h3 className="sv-feature-title">Verified Reviews</h3>
            <p className="sv-feature-desc">
              Every session gets reviewed. Build your reputation with honest ratings and become a trusted skill exchanger on the platform.
            </p>
          </div>

          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiAward />
            </div>
            <h3 className="sv-feature-title">Credit System</h3>
            <p className="sv-feature-desc">
              Earn credits by teaching. Spend credits to learn. Start with 50 free credits on signup — enough for your first 5 sessions.
            </p>
          </div>

          <div className="sv-glass-card sv-feature-card">
            <div className="sv-icon-circle">
              <FiShield />
            </div>
            <h3 className="sv-feature-title">Safe & Secure</h3>
            <p className="sv-feature-desc">
              JWT authentication, encrypted data, and a review system that keeps the community trustworthy and accountable.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 7 — Featured Skill Profiles
         ========================================== */}
      <section className="sv-profiles-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Community Leaders</div>
          <h2>Meet Our Top Exchangers</h2>
          <p>Students who are making the most of SkillsVersa</p>
        </div>

        <div className="sv-profiles-grid sv-stagger">
          {/* Profile 1 */}
          <div className="sv-glass-card sv-profile-card">
            <div className="sv-avatar-wrapper">
              <div className="sv-avatar-initials">RS</div>
            </div>
            <h3 className="sv-profile-name">Riya Sharma</h3>
            <p className="sv-profile-bio">
              "CS student who loves teaching Python and learning creative skills"
            </p>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Teaches</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-teach">Python</span>
                <span className="sv-mini-pill-teach">Data Science</span>
                <span className="sv-mini-pill-teach">Machine Learning</span>
              </div>
            </div>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Wants to Learn</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-learn">Guitar</span>
                <span className="sv-mini-pill-learn">Photography</span>
              </div>
            </div>

            <div className="sv-profile-stats">
              <div className="sv-rating">
                <FiStar /> 4.9 (28 reviews)
              </div>
              <div>52 sessions</div>
            </div>

            <Link to="/explore" className="sv-btn-view-profile">
              View Profile
            </Link>
          </div>

          {/* Profile 2 */}
          <div className="sv-glass-card sv-profile-card">
            <div className="sv-avatar-wrapper">
              <div className="sv-avatar-initials">AM</div>
            </div>
            <h3 className="sv-profile-name">Arjun Mehta</h3>
            <p className="sv-profile-bio">
              "Design enthusiast and music lover. Always up for a skill swap!"
            </p>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Teaches</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-teach">Photoshop</span>
                <span className="sv-mini-pill-teach">UI/UX Design</span>
                <span className="sv-mini-pill-teach">Figma</span>
              </div>
            </div>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Wants to Learn</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-learn">React</span>
                <span className="sv-mini-pill-learn">Web Development</span>
              </div>
            </div>

            <div className="sv-profile-stats">
              <div className="sv-rating">
                <FiStar /> 4.8 (19 reviews)
              </div>
              <div>35 sessions</div>
            </div>

            <Link to="/explore" className="sv-btn-view-profile">
              View Profile
            </Link>
          </div>

          {/* Profile 3 */}
          <div className="sv-glass-card sv-profile-card">
            <div className="sv-avatar-wrapper">
              <div className="sv-avatar-initials">SP</div>
            </div>
            <h3 className="sv-profile-name">Sneha Patel</h3>
            <p className="sv-profile-bio">
              "Business student teaching communication, learning tech skills"
            </p>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Teaches</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-teach">Public Speaking</span>
                <span className="sv-mini-pill-teach">Excel</span>
                <span className="sv-mini-pill-teach">Resume Building</span>
              </div>
            </div>

            <div className="sv-skills-group">
              <div className="sv-skills-label">Wants to Learn</div>
              <div className="sv-pills-row">
                <span className="sv-mini-pill-learn">Python</span>
                <span className="sv-mini-pill-learn">Data Analysis</span>
              </div>
            </div>

            <div className="sv-profile-stats">
              <div className="sv-rating">
                <FiStar /> 4.7 (15 reviews)
              </div>
              <div>28 sessions</div>
            </div>

            <Link to="/explore" className="sv-btn-view-profile">
              View Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 8 — Testimonials / Reviews
         ========================================== */}
      <section className="sv-testimonials-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Student Reviews</div>
          <h2>What Students Are Saying</h2>
          <p>Real stories from real skill exchangers</p>
        </div>

        <div className="sv-testimonial-carousel sv-fade-in">
          <div className="sv-glass-card sv-testimonial-card">
            <BsQuote className="sv-quote-icon" />

            <div className="sv-stars-row">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <FiStar key={i} fill="#ffd166" />
              ))}
            </div>

            <p className="sv-testimonial-quote">
              "{testimonials[currentTestimonial].quote}"
            </p>

            <div className="sv-testimonial-author">
              <div className="sv-author-avatar">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div>
                <div className="sv-author-name">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="sv-exchange-pill">
                  {testimonials[currentTestimonial].exchange}
                </div>
              </div>
            </div>
          </div>

          <div className="sv-carousel-controls">
            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) => (prev - 1 + testimonials.length) % testimonials.length
                )
              }
              className="sv-carousel-btn"
              aria-label="Previous Testimonial"
            >
              <FiChevronLeft />
            </button>

            <div className="sv-carousel-dots">
              {testimonials.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`sv-dot ${currentTestimonial === index ? 'active' : ''}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
              }
              className="sv-carousel-btn"
              aria-label="Next Testimonial"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 9 — Skill Categories
         ========================================== */}
      <section className="sv-categories-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Diverse Domains</div>
          <h2>Explore Skill Categories</h2>
          <p>From coding to cooking — find your perfect skill exchange</p>
        </div>

        <div className="sv-categories-grid sv-stagger">
          <Link to="/explore?category=programming" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">💻</span>
            <h3 className="sv-category-title">Programming</h3>
            <span className="sv-category-count">120+ skills</span>
          </Link>

          <Link to="/explore?category=design" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">🎨</span>
            <h3 className="sv-category-title">Design & Creative</h3>
            <span className="sv-category-count">85+ skills</span>
          </Link>

          <Link to="/explore?category=music" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">🎵</span>
            <h3 className="sv-category-title">Music & Arts</h3>
            <span className="sv-category-count">60+ skills</span>
          </Link>

          <Link to="/explore?category=languages" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">🌍</span>
            <h3 className="sv-category-title">Languages</h3>
            <span className="sv-category-count">45+ skills</span>
          </Link>

          <Link to="/explore?category=business" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">📈</span>
            <h3 className="sv-category-title">Business & Finance</h3>
            <span className="sv-category-count">55+ skills</span>
          </Link>

          <Link to="/explore?category=academics" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">📚</span>
            <h3 className="sv-category-title">Academics</h3>
            <span className="sv-category-count">90+ skills</span>
          </Link>

          <Link to="/explore?category=fitness" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">🏋️</span>
            <h3 className="sv-category-title">Fitness & Wellness</h3>
            <span className="sv-category-count">30+ skills</span>
          </Link>

          <Link to="/explore?category=lifestyle" className="sv-glass-card sv-category-card">
            <span className="sv-category-emoji">🍳</span>
            <h3 className="sv-category-title">Cooking & Lifestyle</h3>
            <span className="sv-category-count">25+ skills</span>
          </Link>
        </div>
      </section>

      {/* ==========================================
          SECTION 10 — Before vs After Comparison
         ========================================== */}
      <section className="sv-comparison-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Comparison</div>
          <h2>The SkillsVersa Difference</h2>
          <p>See how skill exchange changes the game</p>
        </div>

        <div className="sv-comparison-grid sv-fade-in">
          <div className="sv-vs-badge">VS</div>

          {/* Left Column - BEFORE */}
          <div className="sv-compare-card-before">
            <div className="sv-compare-header before">
              <FiX className="sv-icon-cross" />
              <span>Without SkillsVersa</span>
            </div>
            <ul className="sv-compare-list">
              <li className="sv-compare-item">
                <FiX className="sv-icon-cross" />
                <span>Pay ₹500–₹2000/hr for a private tutor</span>
              </li>
              <li className="sv-compare-item">
                <FiX className="sv-icon-cross" />
                <span>Watch hours of boring YouTube tutorials alone</span>
              </li>
              <li className="sv-compare-item">
                <FiX className="sv-icon-cross" />
                <span>No accountability or feedback</span>
              </li>
              <li className="sv-compare-item">
                <FiX className="sv-icon-cross" />
                <span>One-directional learning — you only consume</span>
              </li>
              <li className="sv-compare-item">
                <FiX className="sv-icon-cross" />
                <span>Expensive online courses you never finish</span>
              </li>
            </ul>
          </div>

          {/* Right Column - AFTER */}
          <div className="sv-compare-card-after">
            <div className="sv-compare-header after">
              <FiCheck className="sv-icon-check" />
              <span>With SkillsVersa</span>
            </div>
            <ul className="sv-compare-list">
              <li className="sv-compare-item">
                <FiCheck className="sv-icon-check" />
                <span>Exchange skills for free — your knowledge is payment</span>
              </li>
              <li className="sv-compare-item">
                <FiCheck className="sv-icon-check" />
                <span>Learn 1-on-1 from a real person who cares</span>
              </li>
              <li className="sv-compare-item">
                <FiCheck className="sv-icon-check" />
                <span>Reviews and ratings keep everyone accountable</span>
              </li>
              <li className="sv-compare-item">
                <FiCheck className="sv-icon-check" />
                <span>Two-way learning — you teach AND learn</span>
              </li>
              <li className="sv-compare-item">
                <FiCheck className="sv-icon-check" />
                <span>Earn credits while you teach, spend them to learn</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 11 — Gamification Teaser
         ========================================== */}
      <section className="sv-gamification-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Rewards & XP</div>
          <h2>Level Up Your Learning</h2>
          <p>Earn XP, unlock badges, and climb the leaderboard</p>
        </div>

        {/* Badges Row */}
        <div className="sv-badges-row sv-stagger">
          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">🌟</div>
            <div className="sv-badge-name">First Exchange</div>
            <div className="sv-badge-tooltip">Complete your first skill swap</div>
          </div>

          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">🔥</div>
            <div className="sv-badge-name">On Fire</div>
            <div className="sv-badge-tooltip">5-session streak</div>
          </div>

          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">🏆</div>
            <div className="sv-badge-name">Top Teacher</div>
            <div className="sv-badge-tooltip">Earn a 5-star average over 10+ sessions</div>
          </div>

          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">💎</div>
            <div className="sv-badge-name">Skill Collector</div>
            <div className="sv-badge-tooltip">Learn 10 different skills</div>
          </div>

          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">⚡</div>
            <div className="sv-badge-name">Quick Learner</div>
            <div className="sv-badge-tooltip">Complete 3 sessions in one week</div>
          </div>

          <div className="sv-badge-item">
            <div className="sv-badge-icon-box">👑</div>
            <div className="sv-badge-name">Hall of Fame</div>
            <div className="sv-badge-tooltip">Reach the top 10 on the leaderboard</div>
          </div>
        </div>

        {/* Mini Leaderboard Preview */}
        <div className="sv-glass-card sv-leaderboard-preview sv-fade-in">
          <div className="sv-lb-header">Top Skill Exchangers This Month</div>
          <table className="sv-lb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>XP Earned</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="sv-rank-medal">🥇</span></td>
                <td style={{ fontWeight: 600 }}>Riya S.</td>
                <td className="sv-gradient-text" style={{ fontWeight: 700 }}>2,450 XP</td>
                <td>👑</td>
              </tr>
              <tr>
                <td><span className="sv-rank-medal">🥈</span></td>
                <td style={{ fontWeight: 600 }}>Arjun M.</td>
                <td className="sv-gradient-text" style={{ fontWeight: 700 }}>2,180 XP</td>
                <td>🏆</td>
              </tr>
              <tr>
                <td><span className="sv-rank-medal">🥉</span></td>
                <td style={{ fontWeight: 600 }}>Sneha P.</td>
                <td className="sv-gradient-text" style={{ fontWeight: 700 }}>1,920 XP</td>
                <td>🔥</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textTransform: 'center', textAlign: 'center' }}>
            <Link to="/leaderboard" className="sv-btn-secondary" style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}>
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 12 — FAQ Accordion
         ========================================== */}
      <section className="sv-faq-section">
        <div className="sv-section-header sv-fade-in">
          <div className="sv-section-tag">Got Questions?</div>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know before you start</p>
        </div>

        <div className="sv-accordion sv-stagger">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`sv-glass-card sv-faq-item ${isOpen ? 'active' : ''}`}
              >
                <button
                  className="sv-faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>"{faq.question}"</span>
                  <div className="sv-faq-toggle">
                    <FiChevronDown />
                  </div>
                </button>
                {isOpen && <div className="sv-faq-answer">{faq.answer}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
