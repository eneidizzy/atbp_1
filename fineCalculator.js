function calculateFine(days, dailyRate) {
    if (days < 0) {
      throw new Error('Количество дней не может быть отрицательным');
    }
    if (dailyRate <= 0) {
      throw new Error('Тариф не может быть нулевым или отрицательным');
    }
    return days * dailyRate;
}

module.exports = calculateFine;