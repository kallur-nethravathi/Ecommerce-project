import DatabaseService from "./db.service.js";
import UtilityHelper from "../utils/helpers.js";
import RequestContext from "../utils/context.js";
import CognitoService from "../utils/aws/cognito.js";
import UserModel from "../models/user.js";

export class EcomService {
  constructor() {
    this.db = DatabaseService.getInstance();
    this.helper = UtilityHelper;
    this.context = RequestContext;
    this.cognito = CognitoService; // Initialize Cognito service
    console.log("EcomService initialized with Database and Cognito");
  }

  async register(data) {
    const { email, password, name} = data;

    // Validate input
    if (!email || !password ) {
      throw new Error("Missing required fields: email, password");
    }

    try {
      // Register user in Cognito
        const cognitoResponse = await this.cognito.signUp(email, password);

      // Save user details to MongoDB
      const user = await this.db.create(UserModel, { email, name});

      return {
        status: 201,
        message: "User registered successfully",
        data: { userId: user._id, cognitoId: cognitoResponse.data?.userId },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(data) {
    const { email, password } = data;

    // Validate input
    if (!email || !password) {
      throw new Error("Missing required fields: email, password");
    }

    try {
      // Authenticate user with Cognito
      const cognitoResponse = await this.cognito.signIn(email, password);
      return {
        status: 200,
        message: "Login successful",
        data: cognitoResponse.data, // Contains token and role
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(data) {
    const { email, code } = data;
    if (!email || !code) {
      throw new Error("Missing required fields: email, code");
    }
    try {
      const response = await this.cognito.confirmSignUp(email, code);
      return {
        status: 200,
        message: "User confirmed successfully",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(data) {
    const { email } = data;
    if (!email) {
      throw new Error("Missing required field: email");
    }
    try {
      const response = await this.cognito.forgotPassword(email);
      return {
        status: 200,
        message: "Password reset code sent to email",
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }
}
