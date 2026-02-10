import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile, getTransactions, getWithdrawalMethods } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, txnRes] = await Promise.all([
        getUserProfile(),
        getTransactions(),
      ]);

      setUser(profileRes.data.user);
      setBalance(profileRes.data.user.balance);
      setTransactions(txnRes.data.transactions);

      try {
        const methodsRes = await getWithdrawalMethods();
        setWithdrawalMethods(methodsRes.data.methods);
      } catch {
        // Withdrawal methods endpoint may not be available yet
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    user,
    balance,
    transactions,
    withdrawalMethods,
    isLoading,
    error,
    refetch: fetchData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
