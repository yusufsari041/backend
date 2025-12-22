export class ImeiValidator {
  static validate(imei: string): { valid: boolean; error?: string } {
    if (!imei) {
      return { valid: false, error: 'IMEI boş olamaz' };
    }

    if (imei.length !== 15) {
      return { valid: false, error: 'IMEI 15 haneli olmalıdır' };
    }

    if (!/^\d+$/.test(imei)) {
      return { valid: false, error: 'IMEI sadece rakamlardan oluşmalıdır' };
    }

    if (!this.luhnCheck(imei)) {
      return { valid: false, error: 'IMEI Luhn algoritması kontrolünden geçemedi' };
    }

    return { valid: true };
  }

  private static luhnCheck(imei: string): boolean {
    let sum = 0;
    const digits = imei.split('').map(Number);

    for (let i = 0; i < 14; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[14];
  }

  static checkImeiStatus(imei: string, existingProducts: any[]): {
    exists: boolean;
    status?: string;
    message: string;
  } {
    const product = existingProducts.find(p => p.imei === imei);

    if (!product) {
      return { exists: false, message: 'IMEI kayıtlı değil' };
    }

    return {
      exists: true,
      status: product.durum,
      message: `IMEI ${product.durum} durumunda`,
    };
  }
}

