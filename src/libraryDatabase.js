class LibraryDatabase {
    constructor() {
        this.books = {
            1: { daysOverdue: 5, dailyRate: 2, isReturned: false },
            2: { daysOverdue: 10, dailyRate: 5, isReturned: false },
            3: { daysOverdue: 2, dailyRate: 10, isReturned: false },
            4: { daysOverdue: 7, dailyRate: 3, isReturned: true }
        };
    }

    async getBorrowInfo(bookId, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const book = this.books[bookId];
                resolve(book ? { ...book } : null);
            }, 10);
        });
    }
}

module.exports = LibraryDatabase;