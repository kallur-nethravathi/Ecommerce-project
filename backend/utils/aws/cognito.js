import AWS from 'aws-sdk';
import crypto from 'crypto';

// Configure AWS SDK with region and credentials from environment variables
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-north-1', // Default to Stockholm region if not set
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Cognito configuration
const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID, // e.g., 'eu-north-1_xxxxxxxxx'
  clientId: process.env.COGNITO_CLIENT_ID,       // e.g., 'xxxxxxxxxxxxxxxxxxxxxxxxxx'
  region: process.env.AWS_REGION || 'eu-north-1',
};

// Create Cognito Identity Service Provider instance
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  region: cognitoConfig.region,
});

// Calculate SecretHash for Cognito requests (required if App Client has a client secret)
function getSecretHash(username) {
  if (!process.env.COGNITO_CLIENT_SECRET) {
    throw new Error('COGNITO_CLIENT_SECRET is not defined in environment variables');
  }
  return crypto
    .createHmac('SHA256', process.env.COGNITO_CLIENT_SECRET)
    .update(username + cognitoConfig.clientId)
    .digest('base64');
}

// Sign up a user in Cognito
async function signUp(email, password) {
  // Validate inputs
  if (!email || !password) {
    throw new Error('Missing required fields for signUp: email, password');
  }

  const params = {
    ClientId: cognitoConfig.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'email', Value: email },
    ],
    SecretHash: getSecretHash(email),
  };

  try {
    const response = await cognitoIdentityServiceProvider.signUp(params).promise();
    return {
      status: 201,
      message: 'User registered successfully',
      data: { userId: response.UserSub },
    };
  } catch (error) {
    throw new Error(`Cognito signUp failed: ${error.message}`);
  }
}

// Sign in a user with Cognito
async function signIn(email, password) {
  // Validate inputs
  if (!email || !password) {
    throw new Error('Missing required fields for signIn: email, password');
  }

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: cognitoConfig.clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: getSecretHash(email),
    },
  };

  try {
    const response = await cognitoIdentityServiceProvider.initiateAuth(params).promise();
    const token = response.AuthenticationResult.IdToken;
    return {
      status: 200,
      message: 'Login successful',
      data: { token },
    };
  } catch (error) {
    throw new Error(`Cognito signIn failed: ${error.message}`);
  }
}

// Confirm sign up (verify OTP)
async function confirmSignUp(email, code) {
  if (!email || !code) {
    throw new Error('Missing required fields for confirmSignUp: email, code');
  }
  const params = {
    ClientId: cognitoConfig.clientId,
    Username: email,
    ConfirmationCode: code,
    SecretHash: getSecretHash(email),
  };
  try {
    await cognitoIdentityServiceProvider.confirmSignUp(params).promise();
    return {
      status: 200,
      message: 'Email confirmed successfully',
    };
  } catch (error) {
    throw new Error(`Cognito confirmSignUp failed: ${error.message}`);
  }
}

// Forgot password (send reset code to user's email)
async function forgotPassword(email) {
  if (!email) {
    throw new Error('Missing required field for forgotPassword: email');
  }

  const params = {
    ClientId: cognitoConfig.clientId,
    Username: email,
    SecretHash: getSecretHash(email),
  };

  try {
    const response = await cognitoIdentityServiceProvider.forgotPassword(params).promise();
    return {
      status: 200,
      message: 'Password reset code sent to email',
      data: response,
    };
  } catch (error) {
    throw new Error(`Cognito forgotPassword failed: ${error.message}`);
  }
}

export default { cognitoConfig, cognitoIdentityServiceProvider, signUp, signIn, confirmSignUp, forgotPassword };