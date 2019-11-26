const BASE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const randomNumber = (min = 0, max = 1) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const simulateNetworkLatency = (min = 30, max = 1500) =>
  delay(randomNumber(min, max));

async function callApi(endpoint, options = {}) {
  await simulateNetworkLatency();

  options.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const url = BASE_URL + endpoint;
  const response = await fetch(url, options);
  console.log(url);
  console.log(response);
  
  const data = await response.json();
  console.log(data);

  return data;
}

const api = {
  places: {
    predictions(apiKey, destination, longitude, latitude) {
      jsonResult = callApi(`json?key=${apiKey}&input={${destination}}&location=${latitude},${longitude}&radius=2000&language=es`);
      console.log("jsonResult:::");
      console.log(jsonResult);
      
      
      return jsonResult
      // Para simular cuando no retorna datos
      //return []

      // Para simular que ocurre un error
      // throw new Error("Not found")

      // throw new Error('500: Server Error')

    }
  },
};

export default api;
