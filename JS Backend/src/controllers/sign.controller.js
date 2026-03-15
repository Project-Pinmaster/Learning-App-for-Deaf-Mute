const aiService = require("../services/ai.services");

exports.predictSign = async (req, res) => {
  try {

    const image = req.body.image;

    const prediction = await aiService.predict(image);

    res.json({
      success: true,
      text: prediction
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Prediction failed"
    });

  }
};