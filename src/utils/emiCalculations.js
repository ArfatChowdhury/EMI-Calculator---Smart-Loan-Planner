/**
 * EMI & Loan Calculation Utilities
 */

/**
 * Calculate Monthly EMI using Reducing Balance method
 * Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
 */
export const calculateReducingEMI = (principal, annualRate, tenureMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;

    const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return Math.round(emi);
};

/**
 * Calculate Monthly EMI using Flat Rate method
 * Formula: (Principal + (Principal x Rate x Tenure)) / Tenure
 */
export const calculateFlatEMI = (principal, annualRate, tenureMonths) => {
    const totalInterest = (principal * annualRate * (tenureMonths / 12)) / 100;
    const emi = (principal + totalInterest) / tenureMonths;
    return Math.round(emi);
};

/**
 * Calculate Prepayment Savings
 * Returns object with potential interest and time saved
 */
export const calculatePrepaymentSavings = (principal, annualRate, tenureMonths, extraMonthly) => {
    const monthlyRate = annualRate / 12 / 100;
    const originalEMI = calculateReducingEMI(principal, annualRate, tenureMonths);
    const totalWithExtra = originalEMI + extraMonthly;

    let balance = principal;
    let months = 0;
    let totalInterestSpent = 0;

    while (balance > 0 && months < 600) { // Safety cap at 50 years
        const interestForMonth = balance * monthlyRate;
        totalInterestSpent += interestForMonth;

        const principalPaid = totalWithExtra - interestForMonth;
        balance -= principalPaid;
        months++;
    }

    const originalTotalInterest = (originalEMI * tenureMonths) - principal;

    return {
        newTenure: months,
        tenureSaved: Math.max(0, tenureMonths - months),
        interestSaved: Math.max(0, originalTotalInterest - totalInterestSpent),
    };
};

/**
 * Generate Monthly Amortization Schedule
 */
export const generateAmortizationSchedule = (principal, annualRate, tenureMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    const emi = calculateReducingEMI(principal, annualRate, tenureMonths);

    let balance = principal;
    const schedule = [];

    for (let i = 1; i <= tenureMonths; i++) {
        const interest = balance * monthlyRate;
        const principalPaid = Math.min(balance, emi - interest);
        const opening = balance;
        balance -= principalPaid;

        schedule.push({
            month: i,
            openingBalance: opening,
            interestPaid: interest,
            principalPaid: principalPaid,
            closingBalance: Math.max(0, balance),
        });

        if (balance <= 0) break;
    }

    return schedule;
};
