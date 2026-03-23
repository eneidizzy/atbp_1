const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../server');

let response = null;

Given('сервис доступен по адресу {string}', async function (path) {
    const res = await request(app).get(path);
    if (res.status !== 200 || res.body.status !== 'online') {
        throw new Error(`Сервис недоступен. Статус: ${res.status}, тело: ${JSON.stringify(res.body)}`);
    }
});

Given('книга с ID {int} для пользователя {string}', async function (bookId, userId) {
    this.bookId = bookId;
    this.userId = userId;
    this.useGetData = false;
    this.daysOverdue = undefined;
    this.dailyRate = undefined;
    this.isReturned = undefined;
    
    const res = await request(app)
        .get(`/api/books/${bookId}`)
        .query({ userId: userId });
    
    if (res.status === 404) {
        this.bookNotFound = true;
    } else if (res.status === 200) {
        this.bookNotFound = false;
        this.bookData = res.body.data;
        this.daysOverdueFromGet = this.bookData.daysOverdue;
        this.dailyRateFromGet = this.bookData.dailyRate;
        this.isReturnedFromGet = this.bookData.isReturned;
    } else {
        throw new Error(`Неожиданный статус: ${res.status}`);
    }
});

When('я получаю данные книги по ID', async function () {
    const res = await request(app)
        .get(`/api/books/${this.bookId}`)
        .query({ userId: this.userId });
    
    response = res;
});

Given('количество дней просрочки равно {int}', function (days) {
    this.daysOverdue = days;
    this.useGetData = false;
});

Given('ежедневный тариф составляет {int}', function (rate) {
    this.dailyRate = rate;
    this.useGetData = false;
});

Given('книга возвращена', function () {
    this.isReturned = true;
    this.useGetData = false;
});

When('я отправляю POST запрос на {string}', async function (path) {
    let payload = {
        bookId: this.bookId,
        userId: this.userId
    };
    
    if (this.isReturned !== undefined) {
        payload.isReturned = this.isReturned;
    } else if (this.daysOverdue !== undefined && this.dailyRate !== undefined) {
        payload.daysOverdue = this.daysOverdue;
        payload.dailyRate = this.dailyRate;
        if (this.isReturned !== undefined) {
            payload.isReturned = this.isReturned;
        }
    } else if (this.bookData && !this.useGetData) {
        payload.daysOverdue = this.bookData.daysOverdue;
        payload.dailyRate = this.bookData.dailyRate;
        payload.isReturned = this.bookData.isReturned;
    }
    
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    
    response = await request(app)
        .post(path)
        .send(payload);
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
});

Then('API возвращает статус-код {int}', function (expectedCode) {
    if (response.status !== expectedCode) {
        throw new Error(`Ожидался статус ${expectedCode}, получен ${response.status}. Ответ: ${JSON.stringify(response.body)}`);
    }
});

Then('ответ содержит сообщение {string}', function (expectedMessage) {
    const actualMessage = response.body.status || response.body.message;
    if (!actualMessage || !actualMessage.includes(expectedMessage)) {
        throw new Error(`Ожидалось сообщение "${expectedMessage}", получено: ${JSON.stringify(response.body)}`);
    }
});

Then('размер штрафа равен {int}', function (expectedFine) {
    if (response.status === 200) {
        if (!response.body.data || response.body.data.fine === undefined) {
            throw new Error(`В ответе нет поля fine: ${JSON.stringify(response.body)}`);
        }
        
        const actualFine = response.body.data.fine;
        if (actualFine !== expectedFine) {
            throw new Error(`Ожидался штраф ${expectedFine}, получен ${actualFine}. Полный ответ: ${JSON.stringify(response.body)}`);
        }
        
        console.log(`Штраф ${actualFine} соответствует ожидаемому ${expectedFine}`);
    } else {
        if (response.body.data && response.body.data.fine !== undefined) {
            throw new Error(`Не ожидался расчет штрафа при ошибке, но получен: ${response.body.data.fine}`);
        }
    }
});

Then('ответ содержит текст ошибки {string}', function (expectedError) {
    if (!response.body.message || !response.body.message.includes(expectedError)) {
        throw new Error(`Ожидалась ошибка "${expectedError}", получено: ${JSON.stringify(response.body)}`);
    }
    console.log(`Ошибка "${expectedError}" найдена в ответе`);
});