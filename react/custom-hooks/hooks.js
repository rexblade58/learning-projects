// Exercise: Custom Hooks and Performance
//
// Senior-level concepts: custom hooks, useCallback/useMemo,
// useReducer, context + reducer patterns, and refs.

import React, {
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

// --- Custom hook: useLocalStorage ---
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((next) => {
    setValue((current) => {
      const resolved =
        typeof next === 'function' ? next(current) : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  return [value, setStoredValue];
}

// --- Custom hook: useDebounce ---
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// --- Custom hook: usePrevious ---
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// --- Reducer + Context state management ---
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

// --- Performance-focused component ---
export function ExpensiveList({ items, onSelect }) {
  // Only re-renders when items reference changes
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price, 0),
    [items]
  );

  const handleSelect = useCallback(
    (id) => onSelect(id),
    [onSelect]
  );

  return (
    <div>
      <p>Total: {total}</p>
      {items.map((item) => (
        <button key={item.id} onClick={() => handleSelect(item.id)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}

import { createContext, useEffect } from 'react';
