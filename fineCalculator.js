function calculateFine(daysLate, dailyRate) {
    if (daysLate < 0) {
      throw new Error('Количество дней не может быть отрицательным');
    }
    if (dailyRate <= 0) {
      throw new Error('Тариф не может быть нулевым или отрицательным');
    }
  
    return daysLate * dailyRate;
  }
  
  module.exports = calculateFine;