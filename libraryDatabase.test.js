const LibraryDatabase = require('./libraryDatabase');

describe('LibraryDatabase', () => {
    let db;

    beforeEach(() => {
        db = new LibraryDatabase();
    });

    describe('getBorrowInfo', () => {
        test('должен вернуть данные для книги ID=1', async () => {
            const result = await db.getBorrowInfo(1, 'user1');
            expect(result).toEqual({ daysOverdue: 5, dailyRate: 2, isReturned: false });
        });

        test('должен вернуть данные для книги ID=2', async () => {
            const result = await db.getBorrowInfo(2, 'user2');
            expect(result).toEqual({ daysOverdue: 10, dailyRate: 5, isReturned: false });
        });

        test('должен вернуть данные для книги ID=3', async () => {
            const result = await db.getBorrowInfo(3, 'user3');
            expect(result).toEqual({ daysOverdue: 2, dailyRate: 10, isReturned: false });
        });

        test('должен вернуть данные для возвращенной книги ID=4', async () => {
            const result = await db.getBorrowInfo(4, 'user4');
            expect(result).toEqual({ daysOverdue: 7, dailyRate: 3, isReturned: true });
        });

        test('должен вернуть null для несуществующей книги', async () => {
            const result = await db.getBorrowInfo(999, 'user');
            expect(result).toBeNull();
        });

        test('должен возвращать Promise', () => {
            const result = db.getBorrowInfo(1, 'user');
            expect(result).toBeInstanceOf(Promise);
        });

        test('должен возвращать копию объекта', async () => {
            const result1 = await db.getBorrowInfo(1, 'user');
            const result2 = await db.getBorrowInfo(1, 'user');
            expect(result1).toEqual(result2);
            expect(result1).not.toBe(result2);
        });
    });
});