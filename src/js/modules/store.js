const LOCALSTORAGE_KEY = 'githubGoals';

export const save = (data) => {
  console.log('Saving data to localStorage', data);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
};

export const load = () => {
  const data = localStorage.getItem(LOCALSTORAGE_KEY);
  const parsedData = JSON.parse(data);
  console.log('Retrieving data from localStorage', data, parsedData);
  return parsedData;
};

export const reset = () => {
  const data = localStorage.getItem(LOCALSTORAGE_KEY);
  const parsedData = JSON.parse(data);
  console.log('Clearing data from localStorage', data, parsedData);
  localStorage.removeItem(LOCALSTORAGE_KEY);
};
