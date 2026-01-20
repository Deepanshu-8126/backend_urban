// ✅ SUCCESS RESPONSE
exports.success = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    code: "OK",
    message,
    data
  });
};

// ✅ VALIDATION ERROR (400)
exports.badRequest = (res, message = "Bad Request") => {
  return res.status(400).json({
    status: "error",
    code: "VALIDATION_ERROR",
    message
  });
};

// ✅ SYSTEM ERROR (500)
exports.internalError = (res, message = "Internal Server Error") => {
  return res.status(500).json({
    status: "error",
    code: "SYSTEM_ERROR",
    message: "Something went wrong. Please try again later."
  });
};