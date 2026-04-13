const API_BASE = 'http://localhost:3000';

const bookIdInput = document.getElementById('bookId');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const resultContent = document.getElementById('resultContent');
const errorContent = document.getElementById('errorContent');

function showResult(fine, daysOverdue, dailyRate) {
    resultContent.innerHTML = `
        <p><strong>Сумма штрафа:</strong> ${fine} руб.</p>
        <p><strong>Количество дней просрочки:</strong> ${daysOverdue} дн.</p>
        <p><strong>Тариф:</strong> ${dailyRate} руб./день</p>
        <p><strong>Расчет:</strong> ${daysOverdue} × ${dailyRate} = ${fine} руб.</p>
    `;
    resultDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
}

function showError(message) {
    errorContent.innerHTML = `<p>${message}</p>`;
    errorDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
}

function clearResults() {
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
}

async function calculateFine() {
    clearResults();
    
    const bookId = bookIdInput.value.trim();
    
    if (bookId === '') {
        showError('Пожалуйста, введите ID книги');
        return;
    }
    
    if (isNaN(bookId)) {
        showError('ID книги должен быть числом');
        return;
    }
    
    const bookIdNum = parseInt(bookId);
    
    if (bookIdNum < 0) {
        showError('ID книги не может быть отрицательным');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/books/${bookIdNum}?userId=test_user`);
        const data = await response.json();
        
        if (data.status === 'error') {
            showError(data.message);
            return;
        }
        
        const { daysOverdue, dailyRate, isReturned } = data.data;
        
        if (isReturned) {
            showResult(0, daysOverdue, dailyRate);
            return;
        }
        
        const calcResponse = await fetch(`${API_BASE}/api/calculate-fine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookIdNum,
                userId: 'test_user',
                daysOverdue: daysOverdue,
                dailyRate: dailyRate,
                isReturned: isReturned
            })
        });
        
        const calcData = await calcResponse.json();
        
        if (calcData.status === 'error') {
            showError(calcData.message);
            return;
        }
        
        showResult(
            calcData.data.fine,
            calcData.data.daysOverdue,
            calcData.data.dailyRate
        );
        
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Ошибка подключения к серверу. Убедитесь, что сервер запущен.');
    }
}

calculateBtn.addEventListener('click', calculateFine);

bookIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateFine();
    }
});