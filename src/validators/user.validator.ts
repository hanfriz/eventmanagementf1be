import { body, param, query, ValidationChain } from "express-validator";
import { isValidEmail } from "../utils/common.helper";

// Custom CUID validator (Prisma uses CUID format, not UUID)
const isCuid = (value: string) => {
  return /^c[a-z0-9]{24}$/.test(value);
};

export const validateCreateUser: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .custom((email) => {
      if (!isValidEmail(email)) {
        throw new Error("Invalid email format");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase, one uppercase, and one number"
    ),
  body("fullName")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE"])
    .withMessage("Gender must be MALE or FEMALE"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Birth date must be a valid date"),
  body("role")
    .optional()
    .isIn(["USER", "ORGANIZER", "ADMIN"])
    .withMessage("Role must be USER, ORGANIZER, or ADMIN"),
];

export const validateUpdateUser: ValidationChain[] = [
  body("fullName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE"])
    .withMessage("Gender must be MALE or FEMALE"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Birth date must be a valid date"),
  body("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
];

export const validateLogin: ValidationChain[] = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateUserId: ValidationChain[] = [
  param("id").custom(isCuid).withMessage("Valid user ID is required"),
];

/**
 * User validator object with grouped validation methods
 */
export const userValidator = {
  createUser: validateCreateUser,
  updateUser: validateUpdateUser,
  login: validateLogin,
  userId: validateUserId,
};
