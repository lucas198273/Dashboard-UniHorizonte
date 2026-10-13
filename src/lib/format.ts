const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const formatDate = (value: string | Date): string => dateFormatter.format(new Date(value));
export const formatCurrency = (value: number): string => currencyFormatter.format(value);
