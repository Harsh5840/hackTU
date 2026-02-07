export const calculateStockStatus = (quantity: number, reorderLevel: number) => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity < (reorderLevel * 0.5)) return 'CRITICAL';
  if (quantity <= reorderLevel) return 'LOW';
  if (quantity > (reorderLevel * 5)) return 'OVERSTOCK';
  return 'NORMAL';
};

export const calculateDaysOfSupply = (currentStock: number, dailyAverageSales: number) => {
  if (dailyAverageSales === 0) return 999; // Infinite
  return Math.floor(currentStock / dailyAverageSales);
};
