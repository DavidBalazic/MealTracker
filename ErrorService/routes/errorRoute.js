const express = require("express");
const router = express.Router();
const errors = require("../models/errors");

// GET: Get all errors
router.get("/", async (req, res) => {
  /*#swagger.tags = ['Errors']
    #swagger.description = 'Get all errors' 
    #swagger.summary = 'Get all errors' 
    #swagger.schema = {
    [{message: "Error message1", code: 500}, {message: "Error message2", code: 500}]}
    }
    #swagger.responses[200] = {
            description: 'List of errors',
    }
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const res_errors = errors.getErrors();
    res.status(200).json(res_errors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new error
router.post("/new", async (req, res) => {
  /*#swagger.tags = ['Errors']
    #swagger.description = 'Create a new error' 
    #swagger.summary = 'Create a new error' 
    #swagger.parameters['message'] = {
            in: 'body',
            description: 'Error message',
            required: true,
            type: 'string',
            schema: "Error message here",
    } 
    #swagger.parameters['code'] = {
            in: 'body',
            description: 'Error code',
            required: true,
            type: 'integer',
            schema: 404,
    } 
    #swagger.responses[200] = {
            description: 'Error created successfully',
    }
      #swagger.responses[400] = {
            description: 'Required: message, code'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { message, code } = req.body;

    if (!message || !code) {
      return res.status(400).json({ message: "Required: message, code" });
    }

    errors.newError(message, code);

    res
      .status(200)
      .json({ status: "created", message: "Error created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Clear all errors
router.delete("/clear", async (req, res) => {
  /*#swagger.tags = ['Errors']
    #swagger.description = 'Clear all errors' 
    #swagger.summary = 'Clear all errors' 
    #swagger.responses[200] = {
            description: 'Errors cleared',
    }
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    errors.clearErrors();
    res.status(200).json({ status: "cleared", message: "Errors cleared" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Get error by code
router.get("/:code", async (req, res) => {
  /*#swagger.tags = ['Errors']
    #swagger.description = 'Get error by code' 
    #swagger.summary = 'Get error by code' 
    #swagger.parameters['code'] = {
            in: 'path',
            description: 'Error code',
            required: true,
            type: 'integer',
            schema: 404,
    } 
    #swagger.responses[200] = {
            description: 'Error found',
    }
    #swagger.responses[404] = {
            description: 'Error not found'
    }
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const code = req.params.code;
    const error = errors.getError(parseInt(code));

    if (!error) {
      return res.status(404).json({ message: "Error not found" });
    }

    res.status(200).json(error);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
