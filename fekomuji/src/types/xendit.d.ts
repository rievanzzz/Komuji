declare global {
  interface XenditInvoiceResponse {
    id: string;
    external_id: string;
    user_id: string;
    status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED';
    merchant_name: string;
    amount: number;
    payer_email: string;
    description: string;
    invoice_url: string;
    expiry_date: string;
    created: string;
    updated: string;
    payment_channel?: string;
    payment_method?: string;
  }

  interface XenditPaymentConfig {
    public_key: string;
    api_url: string;
    enabled_payments: string[];
    available_banks: Record<string, string>;
    available_ewallets: Record<string, string>;
  }
}

export {};
