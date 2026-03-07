/**
 * Currency Formatter
 */

export const formatCurrency = (amount, currencyCode = 'BDT') => {
    if (amount === undefined || amount === null) return '';

    const locales = {
        BDT: 'en-IN', // Indian locale uses lakh/crore system which is same for BDT
        INR: 'en-IN',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
    };

    const symbols = {
        BDT: '৳',
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
    };

    const locale = locales[currencyCode] || 'en-US';
    const symbol = symbols[currencyCode] || '';

    // For BDT we want the symbol prefix
    try {
        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        let formatted = formatter.format(amount);

        // Special handling for BDT to ensure it uses the symbol correctly if Intl doesn't provide it
        return `${symbol}${formatted}`;
    } catch (e) {
        return `${symbol}${amount.toLocaleString()}`;
    }
};
