import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const LOANS_STORAGE_KEY = '@loans_data';

export const useLoans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return {
        loans,
        loading,
        saveLoan,
        deleteLoan,
        refreshLoans: loadLoans,
    };
};
