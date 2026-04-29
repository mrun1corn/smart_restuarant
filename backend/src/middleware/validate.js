import { z } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req properties with validated/transformed ones
    req.body = validated.body;
    req.query = validated.query;
    req.params = validated.params;
    
    next();
  } catch (e) {
    const errors = e.errors || e.issues || [];
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};

export default validate;
