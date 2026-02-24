export const getFinancialYear = (dateStr, startMonth = 'Jan') => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (0 = Jan, 6 = Jul)

    if (startMonth === 'Jul') {
        // Australian Financial Year: July to June
        if (month >= 6) {
            return `FY${year.toString().slice(-2)}/${(year + 1).toString().slice(-2)}`;
        } else {
            return `FY${(year - 1).toString().slice(-2)}/${year.toString().slice(-2)}`;
        }
    } else {
        // Calendar Year: Jan to Dec
        return year.toString();
    }
};

export const getAllFinancialYears = (items, dateField = 'date', startMonth = 'Jan') => {
    const years = new Set(items.map(item => getFinancialYear(item[dateField], startMonth)));
    // Sort descending
    return Array.from(years).sort().reverse();
};
