jest.mock('../src/libraryDatabase');

const LibraryDatabase = require('../src/libraryDatabase');
const calculateFine = require('../src/fineCalculator');

describe('calculateFine', () => {
    let mockDbInstance;
    
    beforeEach(() => {
        mockDbInstance = new LibraryDatabase();
        jest.clearAllMocks();
    });

    test('Конструктор БД вызывается по умолчанию', async () => {
        const mockConstructor = jest.fn();
        LibraryDatabase.mockImplementationOnce(() => {
            mockConstructor();
            return {
                getBorrowInfo: jest.fn().mockResolvedValue({
                    daysOverdue: 5,
                    dailyRate: 2,
                    isReturned: false
                })
            };
        });
    
        const result = await calculateFine(1, 'user1');
        
        expect(result).toBe(10);
        expect(mockConstructor).toHaveBeenCalledTimes(1);
    });

    describe('ПОЗИТИВНЫЕ СЦЕНАРИИ', () => {
        test('Должен рассчитать штраф с тарифом 2', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 5,
                dailyRate: 2,
                isReturned: false
            });

            const result = await calculateFine(1, 'user1', mockDbInstance);
            
            expect(result).toBe(10);
            expect(mockDbInstance.getBorrowInfo).toHaveBeenCalledWith(1, 'user1');
        });
        test('Должен рассчитать штраф с тарифом 5', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 10,
                dailyRate: 5,
                isReturned: false
            });

            const result = await calculateFine(2, 'user2', mockDbInstance);
            
            expect(result).toBe(50);
            expect(mockDbInstance.getBorrowInfo).toHaveBeenCalledWith(2, 'user2');
        });
        test('Должен рассчитать штраф с тарифом 10', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 2,
                dailyRate: 10,
                isReturned: false
            });

            const result = await calculateFine(3, 'user3', mockDbInstance);
            
            expect(result).toBe(20);
            expect(mockDbInstance.getBorrowInfo).toHaveBeenCalledWith(3, 'user3');
        });
        test('Должен вернуть 0 для возвращенной книги', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 10,
                dailyRate: 5,
                isReturned: true
            });

            const result = await calculateFine(4, 'user4', mockDbInstance);
            
            expect(result).toBe(0);
            expect(mockDbInstance.getBorrowInfo).toHaveBeenCalledWith(4, 'user4');
        });
    });

    describe('ГРАНИЧНЫЕ СЦЕНАРИИ', () => {
        test('Граничное значение: 0 дней просрочки', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 0,
                dailyRate: 2,
                isReturned: false
            });

            const result = await calculateFine(1, 'user', mockDbInstance);
            
            expect(result).toBe(0);
        });
    });

    describe('НЕГАТИВНЫЕ СЦЕНАРИИ', () => {
        test('Запись в БД не найдена', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue(null);

            await expect(calculateFine(999, 'user', mockDbInstance))
                .rejects
                .toThrow('Запись о выдаче книги не найдена');
        });
        test('Отрицательное количество дней', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: -1,
                dailyRate: 2,
                isReturned: false
            });

            await expect(calculateFine(1, 'user', mockDbInstance))
                .rejects
                .toThrow('Количество дней не может быть отрицательным');
        });
        test('Нулевой тариф', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 5,
                dailyRate: 0,
                isReturned: false
            });

            await expect(calculateFine(1, 'user', mockDbInstance))
                .rejects
                .toThrow('Тариф не может быть нулевым или отрицательным');
        });
        test('Отрицательный тариф', async () => {
            mockDbInstance.getBorrowInfo.mockResolvedValue({
                daysOverdue: 5,
                dailyRate: -2,
                isReturned: false
            });

            await expect(calculateFine(1, 'user', mockDbInstance))
                .rejects
                .toThrow('Тариф не может быть нулевым или отрицательным');
        });
        test('Сервер БД недоступен', async () => {
            mockDbInstance.getBorrowInfo.mockRejectedValue(new Error('Connection timeout'));

            await expect(calculateFine(1, 'user', mockDbInstance))
                .rejects
                .toThrow('Ошибка доступа к БД: Connection timeout');
        });
    });
});