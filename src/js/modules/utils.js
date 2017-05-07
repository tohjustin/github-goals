export const convertPercentageToColor = (percentage) => {
  if (percentage < 50) {
    return '#F40F2B';
  } else if (percentage < 100) {
    return '#F5A623';
  } else if (isFinite(percentage)) {
    return '#7ED321';
  }

  return '#0366D6';
};
