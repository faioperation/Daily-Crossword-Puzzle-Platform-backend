/**
 * Middleware to parse stringified JSON or numbers from multipart/form-data requests
 * @param {string[]} fields - Array of field names in req.body to attempt parsing
 */
const parseMultipartFields = (fields = []) => {
  return (req, res, next) => {
    if (req.body) {
      fields.forEach((field) => {
        if (req.body[field] !== undefined && typeof req.body[field] === "string") {
          try {
            // JSON.parse automatically converts JSON arrays, objects, booleans, and numeric strings to their correct JS types
            req.body[field] = JSON.parse(req.body[field]);
          } catch (error) {
            // If it fails to parse (e.g. standard strings that are not valid JSON), keep it as is
          }
        }
      });
    }
    next();
  };
};

export default parseMultipartFields;
