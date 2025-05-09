import { ResponseBuilder } from "../utils/apiResponse.js";
export const validateRequest = (schema, options = {}) => {
    return (req, res, next) => {
      try {
        const validated = schema.validate(req.payload, {
          abortEarly: false,
          ...options,
        });
        
        if (validated.error) {
            let response= ResponseBuilder.fail(validated.error.details, {
               status: 400,
                code: 'BAD_REQUEST'
              });
            return  res.status(response.status).json(response.body)
        }
        
        req.validatedData = validated.value;
        next();
      } catch (error) {
        next(error);
      }
    };
  };