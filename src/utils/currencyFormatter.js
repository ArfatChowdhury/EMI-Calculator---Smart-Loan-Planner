/**
 * Currency Formatter
 */
import { Currencies } from '@/constants/Currencies';

export const formatCurrency = (amount, currencyCode = 'USD') => {
    if (amount === undefined || amount === null) return '';

    const currencyObj = Currencies.find(c => c.code === currencyCode) || Currencies[0];
    const locale = currencyObj.locale;
    const symbol = currencyObj.symbol;

    try {
        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        let formatted = formatter.format(amount);

        // We want to force the symbol because sometimes Intl.NumberFormat doesn't place it where we want
        // or uses the code instead of the symbol depending on the locale.
        return `${symbol}${formatted}`;
    } catch (e) {
        return `${symbol}${amount.toLocaleString()}`;
    }
};
