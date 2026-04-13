const { test, expect } = require('@playwright/test');
const LibraryPage = require('../e2e/pages/LibraryPage');

test.describe('Библиотечный штраф', () => {
    
    let libraryPage;
    
    test.beforeEach(async ({ page }) => {
        libraryPage = new LibraryPage(page);
        await libraryPage.navigate();
    });

    test('Расчет штрафа: книга с просрочкой 5 дней (ID=1)', async () => {
        await libraryPage.enterBookId(1);
        await libraryPage.clickCalculate();
        
        const resultText = await libraryPage.getResultText();
        expect(resultText).toContain('Сумма штрафа: 10 руб.');
        expect(resultText).toContain('5 дн.');
    });

    const daysTestCases = [
        { bookId: 4, expectedDays: 0, expectedFine: 0, desc: '0 дней (возвращена)' },
        { bookId: 3, expectedDays: 2, expectedFine: 20, desc: '2 дня' },
        { bookId: 1, expectedDays: 5, expectedFine: 10, desc: '5 дней' },
        { bookId: 2, expectedDays: 10, expectedFine: 50, desc: '10 дней' }
    ];
    
    for (const testCase of daysTestCases) {
        test(`Data-Driven: ${testCase.desc} (штраф ${testCase.expectedFine} руб.)`, async () => {
            await libraryPage.enterBookId(testCase.bookId);
            await libraryPage.clickCalculate();
            
            const resultText = await libraryPage.getResultText();
            expect(resultText).toContain(`Сумма штрафа: ${testCase.expectedFine} руб.`);
        });
    }

    test('Ошибка: несуществующий ID книги (999)', async () => {
        await libraryPage.enterBookId(999);
        await libraryPage.clickCalculate();
        
        const errorText = await libraryPage.getErrorText();
        expect(errorText).toContain('Книга не найдена');
    });

    test('Ошибка: отрицательный ID (-5)', async () => {
        await libraryPage.enterBookId(-5);
        await libraryPage.clickCalculate();
        
        const errorText = await libraryPage.getErrorText();
        expect(errorText).toContain('ID книги не может быть отрицательным');
    });

    test('Ошибка: ввод букв вместо числа', async () => {
        await libraryPage.enterBookId('abc');
        await libraryPage.clickCalculate();
        
        const errorText = await libraryPage.getErrorText();
        expect(errorText).toContain('ID книги должен быть числом');
    });
});