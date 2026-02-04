exports.calculateSLAExpiry = (priority) => {
  const hours = { high: 24, medium: 48, low: 72 };
  return new Date(Date.now() + hours[priority] * 60 * 60 * 1000);
};