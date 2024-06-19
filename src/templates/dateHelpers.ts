export class dateTemplate {
    static getTemplate() {
        return `
export class dateHelper { 
    static addDays(date: Date, days: number) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static addMonths(date: Date, months: number): Date {
        const newDate = new Date(date.getTime());
        const targetMonth = newDate.getMonth() + months;
        const yearChange = Math.floor(targetMonth / 12);
        const newYear = newDate.getFullYear() + yearChange;
        const newMonth = targetMonth % 12;
        newDate.setFullYear(newYear);
        newDate.setMonth(newMonth);

        return newDate;
    }
    static addYears(date: Date, years: number): Date {
        const newDate = new Date(date.getTime());
        newDate.setFullYear(newDate.getFullYear() + years);
        return newDate;
    }
    static diffInDays(date1: Date, date2: Date) {
        const date1Millis = new Date(date1).getTime();
        const date2Millis = new Date(date2).getTime();
        const diffMillis = Math.abs(date1Millis - date2Millis);
        const diffDays = Math.ceil(diffMillis / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    static diffInMonths(startDate: Date, endDate: Date): number {
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        const yearDiff = endYear - startYear;
        const monthDiff = endMonth - startMonth;
        const totalMonths = yearDiff * 12 + monthDiff;
        return totalMonths;
    }
    static diffInYears(startDate: Date, endDate: Date): number {
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        let yearDiff = endYear - startYear;
        if (endMonth < startMonth || (endMonth === startMonth && endDate.getDate() < startDate.getDate())) {
            yearDiff--;
        }
        
        return yearDiff;
    }
}
        `
    }
}