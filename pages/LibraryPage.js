class LibraryPage {
    constructor(page) {
        this.page = page;
        
        this.bookIdInput = '#bookId';
        this.calculateBtn = '#calculateBtn';
        this.resultDiv = '#result';
        this.errorDiv = '#error';
        this.resultContent = '#resultContent';
        this.errorContent = '#errorContent';
    }

    async navigate() {
        await this.page.goto('http://localhost:3000');
    }

    async enterBookId(bookId) {
        await this.page.fill(this.bookIdInput, String(bookId));
    }

    async clickCalculate() {
        await this.page.click(this.calculateBtn);
    }

    async getResultText() {
        await this.page.waitForSelector(this.resultDiv, { state: 'visible' });
        return await this.page.textContent(this.resultContent);
    }

    async getErrorText() {
        await this.page.waitForSelector(this.errorDiv, { state: 'visible' });
        return await this.page.textContent(this.errorContent);
    }

    async getFineAmount() {
        const resultText = await this.getResultText();
        const match = resultText.match(/Сумма штрафа:\s*(\d+)\s*руб/);
        return match ? parseInt(match[1]) : null;
    }

    async getDaysOverdue() {
        const resultText = await this.getResultText();
        const match = resultText.match(/просрочки:\s*(\d+)\s*дн/);
        return match ? parseInt(match[1]) : null;
    }

    async clearBookId() {
        await this.page.fill(this.bookIdInput, '');
    }

    async isResultVisible() {
        return await this.page.isVisible(this.resultDiv);
    }

    async isErrorVisible() {
        return await this.page.isVisible(this.errorDiv);
    }
}

module.exports = LibraryPage;