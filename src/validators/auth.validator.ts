import { body, ValidationChain } from "express-validator";

// Auth validation rules
export const authValidators = {
  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("fullName")
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters")
      .trim(),
    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters"),
    body("role")
      .optional()
      .isIn(["CUSTOMER", "ORGANIZER", "ADMIN"])
      .withMessage("Role must be CUSTOMER, ORGANIZER, or ADMIN"),
  ] as ValidationChain[],

  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password").exists().withMessage("Password is required"),
  ] as ValidationChain[],
};
