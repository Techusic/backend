const axios = require('axios');

class CurrencyService {
  static async fetchCurrencies() {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      return response.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw new Error('Failed to fetch currencies');
    }
  }

  static async fetchExchangeRates(baseCurrency = 'USD') {
    try {
      // Using a free exchange rate API
      const response = await axios.get(`https://api.exchangerate.host/latest?base=${baseCurrency}`);
      return response.data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Fallback rates in case API fails
      const fallbackRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.0
      };
      
      return fallbackRates;
    }
  }

  static async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    try {
      const rates = await this.fetchExchangeRates(fromCurrency);
      const rate = rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not available for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }
}

module.exports = CurrencyService;