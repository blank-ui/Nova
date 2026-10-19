export interface IndianHoliday {
  name: string;
  type: "National" | "Gazetted" | "Festival";
  description?: string;
}

/**
 * Key Indian National and Gazetted Holidays
 * Keyed by "MM-DD" for fixed-date holidays, plus year-specific lunar/religious festivals.
 */
const FIXED_HOLIDAYS: Record<string, IndianHoliday> = {
  "01-26": { name: "Republic Day", type: "National", description: "Honors the date on which the Constitution of India came into effect." },
  "04-14": { name: "Dr. B.R. Ambedkar Jayanti", type: "Gazetted", description: "Birth anniversary of the Father of the Indian Constitution." },
  "05-01": { name: "Labor Day / Maharashtra Day", type: "Gazetted", description: "International Workers' Day." },
  "08-15": { name: "Independence Day", type: "National", description: "Commemorates the nation's independence in 1947." },
  "10-02": { name: "Mahatma Gandhi Jayanti", type: "National", description: "Birth anniversary of Mahatma Gandhi, Father of the Nation." },
  "12-25": { name: "Christmas", type: "Gazetted", description: "Celebration of the Nativity of Jesus Christ." },
};

/**
 * Calendar year mapped holidays (2025, 2026, 2027)
 */
const YEARLY_HOLIDAYS: Record<string, IndianHoliday> = {
  // 2026 Holidays
  "2026-01-14": { name: "Makar Sankranti / Pongal", type: "Festival", description: "Harvest festival marking the transition of the Sun." },
  "2026-01-26": { name: "Republic Day", type: "National", description: "77th Republic Day of India." },
  "2026-02-15": { name: "Maha Shivratri", type: "Gazetted", description: "Honoring Lord Shiva." },
  "2026-03-03": { name: "Holi (Festival of Colors)", type: "Gazetted", description: "Celebrates the triumph of good over evil." },
  "2026-03-20": { name: "Eid-ul-Fitr", type: "Gazetted", description: "Islamic festival marking the end of Ramadan." },
  "2026-04-03": { name: "Good Friday", type: "Gazetted", description: "Commemoration of the Crucifixion of Jesus Christ." },
  "2026-04-14": { name: "Ambedkar Jayanti", type: "Gazetted", description: "Birth anniversary of Babasaheb Ambedkar." },
  "2026-04-20": { name: "Mahavir Jayanti", type: "Gazetted", description: "Birth anniversary of Lord Mahavira, founder of Jainism." },
  "2026-05-01": { name: "May Day / Maharashtra Day", type: "Gazetted", description: "International Workers' Day." },
  "2026-05-27": { name: "Eid-ul-Adha (Bakrid)", type: "Gazetted", description: "Feast of the Sacrifice." },
  "2026-05-31": { name: "Buddha Purnima", type: "Gazetted", description: "Celebration of Gautama Buddha's birth and enlightenment." },
  "2026-06-26": { name: "Muharram", type: "Gazetted", description: "First month of the Islamic calendar." },
  "2026-08-15": { name: "Independence Day", type: "National", description: "79th Indian Independence Day." },
  "2026-08-28": { name: "Raksha Bandhan", type: "Festival", description: "Bond of protection and love between siblings." },
  "2026-09-04": { name: "Krishna Janmashtami", type: "Festival", description: "Birth anniversary of Lord Krishna." },
  "2026-09-14": { name: "Ganesh Chaturthi", type: "Festival", description: "Arrival of Lord Ganesha to earth." },
  "2026-10-02": { name: "Mahatma Gandhi Jayanti", type: "National", description: "National holiday commemorating Mahatma Gandhi." },
  "2026-10-20": { name: "Dussehra (Vijayadashami)", type: "Gazetted", description: "Celebration of victory over Ravana." },
  "2026-11-08": { name: "Diwali (Festival of Lights)", type: "Gazetted", description: "Major festival celebrating the victory of light over darkness." },
  "2026-11-09": { name: "Govardhan Puja", type: "Festival", description: "Honoring Lord Krishna and nature." },
  "2026-11-10": { name: "Bhai Dooj", type: "Festival", description: "Sibling bonding festival." },
  "2026-11-24": { name: "Guru Nanak Jayanti", type: "Gazetted", description: "Birth of Guru Nanak Dev Ji, founder of Sikhism." },
  "2026-12-25": { name: "Christmas Day", type: "Gazetted", description: "Joyous celebration of Christmas." },
};

/**
 * Returns the holiday for a specific date if it exists.
 * @param year Full year (e.g. 2026)
 * @param monthIndex 0-indexed month (0 for January, 9 for October)
 * @param day Day of the month (1-31)
 */
export function getIndianHoliday(year: number, monthIndex: number, day: number): IndianHoliday | null {
  const monthStr = String(monthIndex + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const fullDateKey = `${year}-${monthStr}-${dayStr}`;
  const fixedKey = `${monthStr}-${dayStr}`;

  return YEARLY_HOLIDAYS[fullDateKey] || FIXED_HOLIDAYS[fixedKey] || null;
}

/**
 * Returns a dictionary of day numbers to IndianHoliday for the given month.
 */
export function getIndianHolidaysForMonth(year: number, monthIndex: number): Record<number, IndianHoliday> {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const result: Record<number, IndianHoliday> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const holiday = getIndianHoliday(year, monthIndex, day);
    if (holiday) {
      result[day] = holiday;
    }
  }

  return result;
}
