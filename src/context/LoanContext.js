import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const LOANS_STORAGE_KEY = '@loans_data';

const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLoan, setActiveLoan] = useState(null);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const storedLoans = await AsyncStorage.getItem(LOANS_STORAGE_KEY);
            if (storedLoans) {
                setLoans(JSON.parse(storedLoans));
            }
        } catch (error) {
            console.error('Failed to load loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveLoan = async (loanData) => {
        try {
            const newLoan = {
                ...loanData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            const updatedLoans = [newLoan, ...loans];
            await AsyncStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
            setLoans(updatedLoans);
            return newLoan;
        } catch (error) {
            console.error('Failed to save loan:', error);
            throw error;
        }
    };

    const deleteLoan = async (id) => {
        try {
            const updatedLoans = loans.filter(loan => loan.id !== id);
            await AsyncStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
            setLoans(updatedLoans);
        } catch (error) {
            console.error('Failed to delete loan:', error);
        }
    };

    const clearAllData = async () => {
        try {
            await AsyncStorage.removeItem(LOANS_STORAGE_KEY);
            setLoans([]);
            setActiveLoan(null);
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    };

    return (
        <LoanContext.Provider value={{
            loans,
            loading,
            saveLoan,
            deleteLoan,
            clearAllData,
            refreshLoans: loadLoans,
            activeLoan,
            setActiveLoan
        }}>
            {children}
        </LoanContext.Provider>
    );
};

export const useLoanContext = () => {
    const context = useContext(LoanContext);
    if (!context) {
        throw new Error('useLoanContext must be used within a LoanProvider');
    }
    return context;
};
