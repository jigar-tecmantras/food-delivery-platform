
import { useEffect, useMemo, useState } from 'react';
import './App.css';

function App() {
  const [menu, setMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [trackingResult, setTrackingResult] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastRole, setLastRole] = useState('customer');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/v1/menu');
        if (!response.ok) throw new Error('Menu unavailable');
        const data = await response.json();
        setMenu(data.dishes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, []);

  const featuredDish = useMemo(() => menu[0], [menu]);

  const handleCheckout = async () => {
    if (!menu.length) {
      setCheckoutResult({ error: 'Menu not loaded yet' });
      return;
    }

    const payload = {
      customer_name: 'Jordan Rivera',
      delivery_address: '512 Harbor Avenue, Suite 3',
      payment_method: 'Visa •••• 1184',
      cart: menu.slice(0, 2).map((dish) => ({ id: dish.id, quantity: 1 })),
    };

    try {
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setCheckoutResult(data.order ? { success: true, order: data.order } : { error: data.message });
    } catch (error) {
      console.error(error);
      setCheckoutResult({ error: 'Unable to complete checkout' });
    }
  };

  const handleTrackOrder = async () => {
    try {
      const response = await fetch('/api/v1/order-tracking/demo123');
      const data = await response.json();
      setTrackingResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDashboard = async (role) => {
    setLastRole(role);
    try {
      const response = await fetch(`/api/v1/dashboard?role=${role}`);
      const data = await response.json();
      setDashboardData({ ...data, role });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Citywide delivery</p>
          <h1>Fresh food, curated menus, delivered to your door.</h1>
          <p className="lead">
            Choose from restaurants around town, follow your order in real time, and manage everything with role-aware dashboards.
          </p>
          <div className="hero-actions">
            <button onClick={handleCheckout} className="primary">
              Try demo checkout
            </button>
            <button onClick={handleTrackOrder} className="ghost">
              Track sample order
            </button>
          </div>
        </div>
        {featuredDish && (
          <div className="hero-card">
            <p className="tag">Chef special</p>
            <h3>{featuredDish.name}</h3>
            <p>{featuredDish.description}</p>
            <span>${featuredDish.price.toFixed(2)}</span>
          </div>
        )}
      </header>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Menu explorer</p>
            <h2>Browse today's featured plates</h2>
          </div>
          <span>Responsive grid • curated for every mood</span>
        </div>
        {loadingMenu ? (
          <p>Loading menu…</p>
        ) : (
          <div className="menu-grid">
            {menu.map((dish) => (
              <article key={dish.id} className="menu-card">
                <div className="menu-card__header">
                  <h3>{dish.name}</h3>
                  <span>${dish.price.toFixed(2)}</span>
                </div>
                <p>{dish.description}</p>
                <div className="menu-card__meta">
                  <p>{dish.category}</p>
                  <button className="base">Add</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Checkout & payments</p>
          <h2>Secure, transparent checkout</h2>
          <p>
            Sample order totals include delivery, tax, and a simulated payment token so UI teams can wire up real gateways later.
          </p>
          {checkoutResult && checkoutResult.success ? (
            <div className="result-card">
              <p className="tag">Order {checkoutResult.order.order_id}</p>
              <p>Total&nbsp;${checkoutResult.order.summary.total.toFixed(2)}</p>
              <p>Payment status: {checkoutResult.order.payment.status}</p>
            </div>
          ) : checkoutResult && checkoutResult.error ? (
            <div className="result-card error">{checkoutResult.error}</div>
          ) : (
            <div className="result-card ghost">Click “Try demo checkout” to simulate.</div>
          )}
        </div>
        <div className="order-tracking">
          <p className="eyebrow">Order tracking</p>
          <h3>Sample stage</h3>
          {trackingResult ? (
            <div>
              <p className="tag">{trackingResult.current_phase}</p>
              <p>ETA: {trackingResult.eta_minutes} min</p>
              <ul>
                {trackingResult.timeline.map((step) => (
                  <li key={step.stage} className={step.completed ? 'done' : ''}>
                    {step.stage}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="result-card ghost">Press “Track sample order” to see live data.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Role-aware dashboards</p>
            <h2>Every persona stays informed</h2>
          </div>
          <div className="role-tabs">
            {['customer', 'restaurant', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => handleDashboard(role)}
                className={lastRole === role ? 'primary' : 'ghost'}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        {dashboardData ? (
          <div className="dashboard-card">
            <h3>{dashboardData.title}</h3>
            <dl>
              {Object.entries(dashboardData)
                .filter(([key]) => !['role', 'title'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/_/g, ' ')}</dt>
                    <dd>{Array.isArray(value) ? JSON.stringify(value) : value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ) : (
          <p>Tap a role above to preview the dashboard.</p>
        )}
      </section>
    </div>
  );
}

export default App;
