/**
 * Formats a number as currency (EUR)
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  /**
   * Formats a date string to localized format
   */
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  /**
   * Formats a percentage value
   */
  export const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  /**
   * Formats a number with thousand separators
   */
  export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };