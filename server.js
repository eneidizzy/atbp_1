const express = require('express');
const LibraryDatabase = require('./libraryDatabase');
const calculateFine = require('./fineCalculator');

const app = express();
const PORT = 3000;

app.use(express.json());

const db = new LibraryDatabase();

app.get('/api/books/:bookId', async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);
        const userId = req.query.userId || 'default_user';
        
        console.log(`[GET] Запрос книги ID=${bookId} для пользователя ${userId}`);
        
        const bookInfo = await db.getBorrowInfo(bookId, userId);
        
        if (!bookInfo) {
            return res.status(404).json({
                status: 'error',
                message: 'Книга не найдена'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                bookId: bookId,
                daysOverdue: bookInfo.daysOverdue,
                dailyRate: bookInfo.dailyRate,
                isReturned: bookInfo.isReturned,
                userId: userId
            }
        });
        
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({
            status: 'error',
            message: 'Внутренняя ошибка сервера'
        });
    }
});

app.post('/api/calculate-fine', async (req, res) => {
    try {
        const { bookId, userId, daysOverdue, dailyRate, isReturned } = req.body;
        
        console.log('[POST] Расчет штрафа:', req.body);
        
        if (!bookId || !userId) {
            return res.status(400).json({
                status: 'error',
                message: 'Не указаны bookId или userId'
            });
        }
        
        if (isReturned === true) {
            return res.status(200).json({
                status: 'success',
                data: {
                    fine: 0,
                    bookId: bookId,
                    userId: userId,
                    message: 'Книга возвращена, штраф не начисляется'
                }
            });
        }
        
        if (daysOverdue === undefined || dailyRate === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Отсутствуют данные для расчета (daysOverdue или dailyRate)'
            });
        }
        
        if (daysOverdue < 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Количество дней просрочки не может быть отрицательным'
            });
        }
        
        if (dailyRate <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Тариф не может быть нулевым или отрицательным'
            });
        }
        
        const fine = daysOverdue * dailyRate;
        
        res.status(200).json({
            status: 'success',
            data: {
                fine: fine,
                bookId: bookId,
                userId: userId,
                daysOverdue: daysOverdue,
                dailyRate: dailyRate,
                calculation: `${daysOverdue} × ${dailyRate} = ${fine}`
            }
        });
        
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({
            status: 'error',
            message: 'Внутренняя ошибка сервера'
        });
    }
});

app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'library-fine-calculator',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=================================`);
        console.log(`Сервер библиотечного штрафа запущен`);
        console.log(`Порт: ${PORT}`);
        console.log(`=================================`);
        console.log(`Доступные эндпоинты:`);
        console.log(`- GET  http://localhost:${PORT}/api/status`);
        console.log(`- GET  http://localhost:${PORT}/api/books/:bookId?userId=xxx`);
        console.log(`- POST http://localhost:${PORT}/api/calculate-fine`);
        console.log(`=================================`);
    });
}