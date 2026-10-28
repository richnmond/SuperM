import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBars,
  FaBoxes,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaClipboardList,
  FaMoneyBillWave,
  FaReceipt,
  FaShoppingCart,
  FaStar,
  FaStore,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import './LandingPage.css';

const DashboardMockup = ({ compact = false }) => (
  <div className={`dashboard-device${compact ? ' dashboard-device--compact' : ''}`}>
    <div className="dashboard-window">
      <aside className="dashboard-sidebar">
        <span className="dashboard-brand"><FaShoppingCart /> SuperM</span>
        <span className="dashboard-nav-item dashboard-nav-item--active"><FaChartLine /> Dashboard</span>
        <span className="dashboard-nav-item"><FaBoxes /> Products</span>
        <span className="dashboard-nav-item"><FaReceipt /> Sales</span>
        <span className="dashboard-nav-item"><FaUsers /> Customers</span>
        <span className="dashboard-nav-item"><FaMoneyBillWave /> Expenses</span>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <span>Good morning, SuperM Store</span>
          <span className="dashboard-avatar">SM</span>
        </div>
        <div className="dashboard-content">
          <h3>Dashboard</h3>
          <div className="dashboard-stats">
            <div><span>Total Sales</span><strong>₦245,670</strong><small>Today</small></div>
            <div><span>Transactions</span><strong>128</strong><small>Today</small></div>
            <div><span>Total Expenses</span><strong>₦42,300</strong><small>This month</small>            </div>
          </div>

          <div className="dashboard-panels">
            <div className="dashboard-chart">
              <strong>Sales overview</strong>
              <svg viewBox="0 0 300 100" role="img" aria-label="Illustrative sales trend chart">
                <path d="M0 82 L35 62 L66 70 L100 40 L132 55 L166 24 L200 45 L234 16 L265 30 L300 4" />
                <path className="dashboard-chart-fill" d="M0 82 L35 62 L66 70 L100 40 L132 55 L166 24 L200 45 L234 16 L265 30 L300 4 L300 100 L0 100Z" />
              </svg>
            </div>
            <div className="dashboard-products">
              <strong>Top products</strong>
              <span><i /> Groceries</span>
              <span><i /> Beverages</span>
              <span><i /> Household</span>
            </div>
          </div>
          <div className="dashboard-table">
            <strong>Recent sales</strong>
            <div><span>Transaction</span><span>Payment</span><span>Amount</span></div>
            <div><span>Sale #1042</span><span>Paid</span><span>₦18,500</span></div>
            <div><span>Sale #1041</span><span>Paid</span><span>₦7,200</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const features = [
  [FaShoppingCart, 'Point of Sale (POS)', 'Fast, easy checkout with the tools you need to serve customers confidently.'],
  [FaBoxes, 'Inventory Management', 'Keep stock levels, product details, and supplier records organized.'],
  [FaUsers, 'Customer Management', 'Maintain customer records and keep service personal.'],
  [FaReceipt, 'Expense Tracking', 'Record business expenses and keep day-to-day costs in view.'],
  [FaChartLine, 'Profit Tracking', 'Understand sales, expenses, and profit in one place.'],
  [FaClipboardList, 'Reports & Analytics', 'Review business activity with clear, useful reporting.'],
];

const LandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
  <div className="landing-page">
    <header className="landing-header">
      <div className="landing-container landing-header-inner">
        <Link to="/" className="landing-logo" aria-label="SuperM home">
          <span className="landing-logo-mark"><FaStore /></span>
          <span>SuperM</span>
        </Link>
        <nav className={`landing-nav${mobileNavOpen ? ' landing-nav--open' : ''}`} aria-label="Main navigation">
          <a href="#home" onClick={closeMobileNav}>Home</a>
          <a href="#features" onClick={closeMobileNav}>Features</a>
          <a href="#pricing" onClick={closeMobileNav}>Pricing</a>
          <a href="#benefits" onClick={closeMobileNav}>About</a>
          <a href="#faq" onClick={closeMobileNav}>FAQ</a>
        </nav>
        <div className="landing-header-actions">
          <Link to="/login" className="landing-sign-in">Sign in</Link>
          <Link to="/login" className="landing-button landing-button--small">Get started <FaArrowRight /></Link>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
          >
            {mobileNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>

    <main>
      <section className="landing-hero" id="home">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow"><FaStore /> All-in-one business management</span>
            <h1>Run your business smarter with <span>SuperM.</span></h1>
            <p>Manage sales, inventory, customers and expenses — all from one powerful, easy-to-use dashboard.</p>
            <div className="landing-hero-actions">
              <Link to="/login" className="landing-button">Get started <FaArrowRight /></Link>
              <a href="#features" className="landing-button landing-button--outline">Explore features</a>
            </div>
            <ul className="landing-trust-list">
              <li><FaCheck /> Sales and inventory tools</li>
              <li><FaCheck /> Business reports</li>
              <li><FaCheck /> One organized workspace</li>
            </ul>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-hero-orb" />
            <div className="landing-laptop">
              <DashboardMockup />
              <div className="landing-laptop-base" />
            </div>
            <div className="landing-phone">
              <div className="landing-phone-top" />
              <span className="landing-phone-brand"><FaShoppingCart /> SuperM</span>
              <small>Today's Sales</small>
              <strong>₦42,300</strong>
              <span className="landing-phone-item"><FaBoxes /> Products</span>
              <span className="landing-phone-item"><FaReceipt /> Sales</span>
              <div className="landing-phone-chart"><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="landing-visual-note">Your business,<br />all in one place.</div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-features" id="features">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">Our features</span>
            <h2>Everything you need to manage and grow</h2>
            <p>SuperM gives you the tools to run your business efficiently, make better decisions, and stay on top of daily operations.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(([Icon, title, description]) => (
              <article className="landing-feature" key={title}>
                <span className="landing-icon-tile"><Icon /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-benefits" id="benefits">
        <div className="landing-container landing-benefits-layout">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">Why SuperM</span>
            <h2>Built for your business. Designed for growth.</h2>
            <p>Whether you run a supermarket, grocery store, restaurant, or retail business, SuperM helps you save time, stay organized, and make informed decisions.</p>
          </div>
          <div className="landing-benefit-grid">
            {[
              [FaCheck, 'Save time', 'Keep everyday business tasks organized in one place.'],
              [FaBoxes, 'Manage inventory', 'Track stock levels and keep inventory organized.'],
              [FaUsers, 'Better customer experience', 'Keep customer details close at hand.'],
              [FaReceipt, 'Control expenses', 'Keep business costs visible and easy to review.'],
              [FaChartLine, 'Understand profitability', 'Use sales and expense insights to guide decisions.'],
              [FaStore, 'Grow with confidence', 'Bring everyday retail operations into one workspace.'],
            ].map(([Icon, title, description]) => (
              <article className="landing-benefit" key={title}>
                <span className="landing-icon-tile"><Icon /></span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-workflow" id="how-it-works">
        <div className="landing-container">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">How it works</span>
            <h2>A clearer view of your business, step by step.</h2>
            <p>Bring everyday store activity together with simple workflows your team can use.</p>
          </div>
          <div className="landing-workflow-grid">
            {[
              [FaBoxes, '01', 'Organize your products', 'Add your products, prices, stock levels, and supplier details.'],
              [FaShoppingCart, '02', 'Record sales', 'Use the point of sale to record transactions and keep sales history.'],
              [FaChartLine, '03', 'Review your progress', 'Check sales, expenses, and profit summaries to understand your business.'],
            ].map(([Icon, number, title, description]) => (
              <article className="landing-workflow-card" key={number}>
                <span className="landing-workflow-number">{number}</span>
                <span className="landing-icon-tile"><Icon /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-showcase" id="product">
        <div className="landing-container">
          <div className="landing-showcase-panel">
            <div className="landing-showcase-devices">
              <div className="landing-showcase-screen"><DashboardMockup compact /></div>
              <div className="landing-showcase-mobile">
                <span><FaStore /> SuperM</span>
                <strong>Products</strong>
                {[
                  ['G', 'Groceries'],
                  ['B', 'Beverages'],
                  ['H', 'Household'],
                  ['B', 'Bakery'],
                ].map(([initial, name]) => (
                  <div key={name}><span>{initial}</span><b>{name}</b><i>In stock</i></div>
                ))}
              </div>
            </div>
            <div className="landing-showcase-copy">
              <span className="landing-section-kicker">Product preview</span>
              <h2>A dashboard built for real business.</h2>
              <p>Get a clearer view of sales, inventory, expenses, and profit — all in one place. Make informed decisions with the tools your business uses every day.</p>
              <ul>
                <li><FaCheck /> Sales and profit tracking</li>
                <li><FaCheck /> Inventory and stock overview</li>
                <li><FaCheck /> Business reports and analytics</li>
              </ul>
              <Link to="/login" className="landing-button">See SuperM in action <FaArrowRight /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta" id="get-started">
        <div className="landing-container landing-cta-inner">
          <span className="landing-cta-icon"><FaStore /></span>
          <div>
            <h2>Ready to take your business to the next level?</h2>
            <p>Bring your everyday business operations together with SuperM.</p>
          </div>
          <Link to="/login" className="landing-button landing-button--light">Get started <FaArrowRight /></Link>
        </div>
      </section>

      <section className="landing-section landing-testimonials" id="customers">
        <div className="landing-container landing-testimonials-layout">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">What our customers say</span>
            <h2>Trusted by business owners</h2>
            <p>See how SuperM brings everyday retail tasks into one clear workspace.</p>
          </div>
          <div className="landing-testimonial-grid">
            {[
              ['AI', 'Adaeze I.', 'Supermarket Owner', 'I can now keep stock, sales, and profit all in one place.'],
              ['CM', 'Chinedu M.', 'Grocery Store Owner', 'The sales history makes it easier to keep track of daily transactions.'],
              ['NE', 'Ngozi E.', 'Retail Store Owner', 'Having products and expenses together helps me stay organized.'],
            ].map(([initials, name, role, quote]) => (
              <article className="landing-testimonial" key={name}>
                <div className="landing-reviewer">
                  <span>{initials}</span>
                  <div><strong>{name}</strong><small>{role}</small></div>
                </div>
                <p>“{quote}”</p>
                <div className="landing-stars" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((star) => <FaStar key={star} />)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-pricing" id="pricing">
        <div className="landing-container landing-pricing-layout">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">Pricing</span>
            <h2>Simple, transparent pricing</h2>
            <p>Choose a plan that fits your business needs. Start free and upgrade as you grow.</p>
          </div>
          <div className="landing-pricing-grid">
            {[
              ['Starter', 'Perfect for small businesses', '₦15,000', ['POS & sales', 'Basic inventory', 'Customer management']],
              ['Business', 'For growing businesses', '₦25,000', ['Everything in Starter', 'Advanced inventory', 'Expense tracking', 'Detailed reports']],
              ['Enterprise', 'For large businesses', '₦45,000', ['Multi-branch support', 'Advanced analytics', 'Priority support']],
            ].map(([name, description, price, included], index) => (
              <article className={`landing-price-card${index === 1 ? ' landing-price-card--popular' : ''}`} key={name}>
                {index === 1 && <span className="landing-popular-label">Most popular</span>}
                <h3>{name}</h3>
                <p>{description}</p>
                <strong>{price}<small> / month</small></strong>
                <ul>
                  {included.map((item) => <li key={item}><FaCheck /> {item}</li>)}
                </ul>
                <Link to="/login" className={`landing-price-button${index === 1 ? ' landing-price-button--primary' : ''}`}>
                  Get started
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-faq" id="faq">
        <div className="landing-container landing-faq-layout">
          <div className="landing-section-heading">
            <span className="landing-section-kicker">Frequently asked questions</span>
            <h2>Questions about SuperM?</h2>
            <p>Find out how SuperM brings your everyday retail workflows together.</p>
          </div>
          <div className="landing-faq-list">
            {[
              ['What can I manage with SuperM?', 'SuperM brings together products and inventory, point-of-sale transactions, sales history, suppliers, customers, expenses, and profit reporting.'],
              ['How do I get started?', 'Use the Get started or Sign in links to open the existing SuperM sign-in page.'],
              ['Can I track expenses and profit?', 'Yes. SuperM includes expense tracking and profit reporting to help you review business performance.'],
              ['Can I manage my products and stock?', 'Yes. The product management tools let you maintain product details, prices, quantities, and supplier relationships.'],
            ].map(([question, answer]) => (
              <details className="landing-faq-item" key={question}>
                <summary>{question}<FaChevronDown /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>

    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-main">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-logo">
              <span className="landing-logo-mark"><FaStore /></span>
              <span>SuperM</span>
            </Link>
            <p>Smarter management. Better business.</p>
          </div>
          <div className="landing-footer-column">
            <h2>Product</h2>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link to="/login">Sign in</Link>
          </div>
          <div className="landing-footer-column">
            <h2>Company</h2>
            <a href="#benefits">Why SuperM</a>
            <a href="#faq">FAQs</a>
            <Link to="/owner">Owner portal</Link>
          </div>
          <div className="landing-footer-column">
            <h2>Get started</h2>
            <Link to="/login">Open SuperM</Link>
            <a href="#product">Product preview</a>
            <a href="#home">Back to top</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} SuperM. All rights reserved.</span>
          <a href="#home">Retail operations made simple.</a>
        </div>
      </div>
    </footer>
  </div>
  );
};

export default LandingPage;
