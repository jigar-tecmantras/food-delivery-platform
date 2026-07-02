
import { useEffect, useMemo, useState } from 'react';
import './App.css';

const roleTabs = [
  { key: 'customer', label: 'Customer' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'admin', label: 'Admin' },
];

function App() {
  const [menu, setMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [statusMessage, setStatusMessage] = useState('Ready to explore');

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    fetchDashboard(selectedRole);
  }, [selectedRole]);

  const featuredDish = useMemo(() => (menu.length ? menu[0] : null), [menu]);

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch('/api/v1/menu');
      if (!response.ok) throw new Error('Unable to load menu');
      const data = await response.json();
      setMenu(data.dishes || []);
      setStatusMessage('Menu updated');
    } catch (error) {
      console.error(error);
      setStatusMessage('Menu is temporarily unavailable');
    } finally {
      setLoadingMenu(false);
    }
  };

  const simulateCheckout = async () => {
    if (!menu.length) {
      setCheckoutResult({ error: 'Menu data not available yet' });
      return;
    }

    const payload = {
      customer_name: 'Avery Riley',
      delivery_address: '902 Harbor View, Apt 7C',
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
      if (data.order) {
        setCheckoutResult({ order: data.order });
        setStatusMessage('Checkout ready for production');
      } else {
        setCheckoutResult({ error: data.message || 'Checkout failed' });
      }
    } catch (error) {
      console.error(error);
      setCheckoutResult({ error: 'Unable to reach checkout API' });
    }
  };

  const trackOrder = async () => {
    try {
      const response = await fetch('/api/v1/order-tracking/demo123');
      const data = await response.json();
      setTracking(data);
      setStatusMessage('Tracking data refreshed');
    } catch (error) {
      console.error(error);
      setStatusMessage('Tracking endpoint unavailable');
    }
  };

  const fetchDashboard = async (role) => {
    try {
      const response = await fetch(`/api/v1/dashboard?role=${role}`);
      const data = await response.json();
      setDashboard({ role, ...data });
    } catch (error) {
      console.error(error);
      setDashboard(null);
      setStatusMessage('Unable to load dashboard data');
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">Citywide delivery</p>
          <h1>Fresh menus, live tracking, and role-aware control for every order.</h1>
          <p className="lead">
            Connect diners, kitchens, and ops with a single responsive experience. This demo hooks into
            Laravel APIs for menu browsing, checkout simulations, and dashboard insights.
          </p>
          <div className="hero__actions">
            <button onClick={simulateCheckout} className="primary">
              Try demo checkout
            </button>
            <button onClick={trackOrder} className="ghost">
              Track sample order
            </button>
          </div>
          <p className="status">{statusMessage}</p>
        </div>
        {featuredDish && (
          <div className="hero__card">
            <p className="tag">Chef special</p>
            <h3>{featuredDish.name}</h3>
            <p>{featuredDish.description}</p>
            <div className="hero__card-meta">
              <span>${featuredDish.price.toFixed(2)}</span>
              <small>{featuredDish.category}</small>
            </div>
          </div>
        )}
      </header>

      <section className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Menu explorer</p>
            <h2>Curated plates for every craving</h2>
          </div>
          <button className="link" onClick={fetchMenu}>
            Refresh menu
          </button>
        </div>
        {loadingMenu ? (
          <div className="pill">Loading menu…</div>
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
                  <small>{dish.category}</small>
                  <button className="base">Add</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section grid-two">
        <article>
          <p className="eyebrow">Checkout & payments</p>
          <h2>Secure totals with delivery + tax + fees</h2>
          <p>
            The sample checkout POST request returns a simulated payment response, letting UI teams
            focus on accuracy without wiring a gateway.
          </p>
          {checkoutResult?.order ? (
            <div className="result">
              <div>
                <strong>Order {checkoutResult.order.order_id}</strong>
                <p>${checkoutResult.order.summary.total.toFixed(2)} total</p>
              </div>
              <p className="tag success">{checkoutResult.order.payment.status}</p>
            </div>
          ) : checkoutResult?.error ? (
            <div className="result error">{checkoutResult.error}</div>
          ) : (
            <div className="result ghost">Click “Try demo checkout” to preview a payment.</div>
          )}
        </article>
        <article>
          <p className="eyebrow">Order tracking</p>
          <h2>Live status visualization</h2>
          {tracking ? (
            <div className="timeline">
              <p className="tag">{tracking.current_phase}</p>
              <p>ETA: {tracking.eta_minutes} min</p>
              <ul>
                {tracking.timeline.map((event) => (
                  <li key={event.stage} className={event.completed ? 'done' : ''}>
                    <span>{event.stage}</span>
                    <span>{event.completed ? 'done' : 'pending'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="result ghost">
              Hit “Track sample order” in the hero to fetch the latest timeline.
            </div>
          )}
        </article>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <p className="eyebrow">Role dashboards</p>
            <h2>Tailored control for customers, restaurants, and admins</h2>
          </div>
          <div className="role-tabs">
            {roleTabs.map((role) => (
              <button
                key={role.key}
                className={selectedRole === role.key ? 'primary' : 'ghost'}
                onClick={() => setSelectedRole(role.key)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
        {dashboard ? (
          <div className="dashboard-card">
            <h3>{dashboard.title}</h3>
            <dl>
              {Object.entries(dashboard)
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
          <p className="pill">Loading dashboard…</p>
        )}
      </section>
    </div>
  );
}

export default App;
