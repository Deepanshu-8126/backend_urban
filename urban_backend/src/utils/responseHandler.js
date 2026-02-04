exports.success = (res, data, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

exports.badRequest = (res, message = 'Bad Request') => {
  return res.status(400).json({
    success: false,
    message
  });
};

exports.internalError = (res, message = 'Internal Server Error') => {
  return res.status(500).json({
    success: false,
    message
  });
};
