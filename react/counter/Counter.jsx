import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={styles.card}>
      <h1 style={styles.count}>{count}</h1>
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={() => setCount(count - 1)}>−</button>
        <button style={styles.btn} onClick={() => setCount(0)}>Reset</button>
        <button style={styles.btn} onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '2.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  count: { fontSize: '4rem', color: '#1a1a2e', margin: '0 0 1rem' },
  buttons: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
  btn: {
    background: '#4a90d9',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: 8,
    fontSize: '1.1rem',
    cursor: 'pointer',
  },
};

export default Counter;
