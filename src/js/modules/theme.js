export const getColor = (percentage) => {
  if (percentage >= 125) {
    // return '#8F2CFA';
    return '#0366D6';
  } else if (percentage >= 100) {
    return '#7ED321';
  } else if (percentage >= 50) {
    return '#F5A623';
  }

  return '#F40F2B';
};
