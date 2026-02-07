export const calculateOrderTotals = (items: any[]) => {
  let subtotal = 0;
  let taxAmount = 0;
  let discountAmount = 0;

  const processedItems = items.map(item => {
    const quantity = item.quantity;
    const unitPrice = Number(item.unitPrice);
    
    // Line Calculations
    const lineDiscount = (unitPrice * (item.discountPercentage || 0)) / 100;
    const discountedPrice = unitPrice - lineDiscount;
    const lineTax = (discountedPrice * (item.taxPercentage || 18)) / 100;
    const lineTotal = (discountedPrice + lineTax) * quantity;

    // Accumulate
    subtotal += discountedPrice * quantity;
    taxAmount += lineTax * quantity;
    discountAmount += lineDiscount * quantity;

    return {
      ...item,
      discountAmount: lineDiscount,
      taxAmount: lineTax,
      lineTotal
    };
  });

  const totalAmount = subtotal + taxAmount; // Subtotal already implies base price

  return {
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    items: processedItems
  };
};
