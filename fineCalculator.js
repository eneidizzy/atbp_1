const LibraryDatabase = require('./libraryDatabase');

async function calculateFine(bookId, userId, db = new LibraryDatabase()) {
    try {
        const record = await db.getBorrowInfo(bookId, userId);
        
        if (!record) {
            throw new Error('Запись о выдаче книги не найдена');
        }
        
        if (record.isReturned) {
            return 0;
        }
        
        if (record.daysOverdue < 0) {
            throw new Error('Количество дней не может быть отрицательным');
        }
        
        if (record.dailyRate <= 0) {
            throw new Error('Тариф не может быть нулевым или отрицательным');
        }
        
        return record.daysOverdue * record.dailyRate;
        
    } catch (error) {
        throw new Error(`Ошибка доступа к БД: ${error.message}`);
    }
}

module.exports = calculateFine;