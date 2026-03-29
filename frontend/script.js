const API_BASE_URL = 'http://localhost:3000/api';

class LibraryFineUI {
    constructor() {
        this.bookIdInput = document.getElementById('bookId');
        this.userIdInput = document.getElementById('userId');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resultArea = document.getElementById('resultArea');
        this.resultContent = document.getElementById('resultContent');
        this.errorArea = document.getElementById('errorArea');
        this.errorContent = document.getElementById('errorContent');
        
        this.init();
    }
    
    init() {
        this.calculateBtn.addEventListener('click', () => this.calculateFine());
        this.bookIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculateFine();
        });
    }
    
    showLoading() {
        this.calculateBtn.disabled = true;
        this.calculateBtn.textContent = 'Загрузка...';
        this.hideResults();
        this.hideErrors();
    }
    
    hideLoading() {
        this.calculateBtn.disabled = false;
        this.calculateBtn.textContent = 'Рассчитать штраф';
    }
    
    showResults(data) {
        this.resultArea.classList.remove('hidden');
        this.resultContent.innerHTML = `
            <div class="fine-details">
                <p><strong>ID книги:</strong> ${data.bookId}</p>
                <p><strong>ID пользователя:</strong> ${data.userId}</p>
                <p><strong>Дней просрочки:</strong> ${data.daysOverdue || 0}</p>
                <p><strong>Тариф:</strong> ${data.dailyRate || 0} руб/день</p>
                <p><strong>Сумма штрафа:</strong> <span class="fine-amount">${data.fine} руб.</span></p>
                <p><strong>Расчет:</strong> ${data.calculation || `${data.daysOverdue} × ${data.dailyRate} = ${data.fine}`}</p>
                ${data.message ? `<p><strong>ℹ️ Примечание:</strong> ${data.message}</p>` : ''}
            </div>
        `;
    }
    
    showError(message) {
        this.errorArea.classList.remove('hidden');
        this.errorContent.innerHTML = `<p style="color: #f44336;">${message}</p>`;
    }
    
    hideResults() {
        this.resultArea.classList.add('hidden');
        this.resultContent.innerHTML = '';
    }
    
    hideErrors() {
        this.errorArea.classList.add('hidden');
        this.errorContent.innerHTML = '';
    }
    
    async calculateFine() {
        const bookId = this.bookIdInput.value.trim();
        const userId = this.userIdInput.value.trim() || 'default_user';
        
        if (!bookId) {
            this.showError('Пожалуйста, введите ID книги');
            return;
        }
        
        if (isNaN(bookId)) {
            this.showError('ID книги должен быть числом');
            return;
        }
        
        const bookIdNum = parseInt(bookId);
        if (bookIdNum < 0) {
            this.showError('ID книги не может быть отрицательным');
            return;
        }
        
        this.showLoading();
        
        try {
            const bookResponse = await fetch(`${API_BASE_URL}/books/${bookIdNum}?userId=${encodeURIComponent(userId)}`);
            const bookData = await bookResponse.json();
            
            if (bookData.status === 'error') {
                throw new Error(bookData.message);
            }
            
            const calculateResponse = await fetch(`${API_BASE_URL}/calculate-fine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookId: bookIdNum,
                    userId: userId,
                    daysOverdue: bookData.data.daysOverdue,
                    dailyRate: bookData.data.dailyRate,
                    isReturned: bookData.data.isReturned
                })
            });
            
            const calculateData = await calculateResponse.json();
            
            if (calculateData.status === 'error') {
                throw new Error(calculateData.message);
            }
            
            this.showResults(calculateData.data);
            this.hideErrors();
            
        } catch (error) {
            this.showError(error.message || 'Произошла ошибка при расчете штрафа');
            this.hideResults();
        } finally {
            this.hideLoading();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LibraryFineUI();
});