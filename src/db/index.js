import Dexie from 'dexie'

export const DEBE = 'debe'
export const HABER = 'haber'
export const CREDIT_CARD = 'credit-card'
export const BANK_TRANSFER = 'bank-transfer'
export const CASH = 'cash'

const db = new Dexie('db');
db.version(2).stores({
    transactions: `++id, date, motive, amount, type, assetType`,
    totals: `date, amount`
});

export default db;
