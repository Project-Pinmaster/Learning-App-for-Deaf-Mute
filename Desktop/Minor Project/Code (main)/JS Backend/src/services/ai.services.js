const axios = require("axios");

exports.predict = async (image) => {

  const response = await axios.post("http://localhost:8000/predict", {
    image: image
  });

  return response.data.text;
};