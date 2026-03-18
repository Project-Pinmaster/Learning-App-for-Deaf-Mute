exports.convertToSign = async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required.'
      });
    }

    return res.json({
      success: true,
      text,
      message: 'Text received for sign conversion.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Voice-to-text conversion failed.'
    });
  }
};
