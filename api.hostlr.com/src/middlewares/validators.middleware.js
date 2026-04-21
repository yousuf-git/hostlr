import { StatusCodes } from 'http-status-codes'
import { validationResult, body, param, query } from 'express-validator'
import { generateApiResponse } from '../services/utilities.service.js'

const validators = {
  password: (attr) =>
    body(attr).trim().notEmpty().withMessage('Password is required.').bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  name: (attr) =>
    body(attr).trim().notEmpty().withMessage('Name is required.'),
  email: (attr) =>
    body(attr).trim().notEmpty().withMessage('Email is required.').bail()
      .isEmail().withMessage('Email must be valid.'),
  generic: (attr, type) => {
    const v = type === 'body' ? body(attr) : type === 'query' ? query(attr) : param(attr)
    return v.trim().notEmpty().withMessage(`${attr} is required.`)
  },
}

export const validateApiAttributes = (attributes, type = 'body', validationArray = []) =>
  attributes.map((attr) =>
    validationArray.includes(attr) && validators[attr] ? validators[attr](attr) : validators.generic(attr, type)
  )

export const checkApiValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const msgs = errors.array().map(e => e.msg)
    return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, msgs[0], { errors: msgs })
  }
  next()
}
