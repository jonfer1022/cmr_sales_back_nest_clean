import { CognitoService } from './cognito.service';
import * as AWS from 'aws-sdk';

jest.mock('aws-sdk', () => {
  const mockCognitoIdentityServiceProvider = {
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    initiateAuth: jest.fn(),
    globalSignOut: jest.fn(),
    getUser: jest.fn(),
  };
  return {
    CognitoIdentityServiceProvider: jest.fn(
      () => mockCognitoIdentityServiceProvider,
    ),
  };
});

describe('CognitoService', () => {
  let service: CognitoService;
  let cognitoIdentity: AWS.CognitoIdentityServiceProvider;

  beforeEach(() => {
    service = new CognitoService(
      'us-west-2',
      'dummyClientId',
      'dummySecretHash',
    );
    cognitoIdentity = new AWS.CognitoIdentityServiceProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      const signUpResponse = { UserConfirmed: true };
      cognitoIdentity.signUp = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(signUpResponse),
      });

      const response = await service.signUp('username', 'password', []);
      expect(response).toBe(signUpResponse);
      expect(cognitoIdentity.signUp).toHaveBeenCalledWith({
        ClientId: 'dummyClientId',
        Password: 'password',
        Username: 'username',
        SecretHash: expect.any(String),
        UserAttributes: [],
      });
    });

    it('should throw an error when sign up fails', async () => {
      cognitoIdentity.signUp = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Sign up error')),
      });

      await expect(service.signUp('username', 'password', [])).rejects.toThrow(
        "Can't sign up user",
      );
      expect(cognitoIdentity.signUp).toHaveBeenCalledWith({
        ClientId: 'dummyClientId',
        Password: 'password',
        Username: 'username',
        SecretHash: expect.any(String),
        UserAttributes: [],
      });
    });
  });

  describe('confirmSignUp', () => {
    it('should confirm a user sign up', async () => {
      const confirmSignUpResponse = { UserConfirmed: true };
      cognitoIdentity.confirmSignUp = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(confirmSignUpResponse),
      });

      const response = await service.confirmSignUp('username', 'code');
      expect(response).toBe(confirmSignUpResponse);
      expect(cognitoIdentity.confirmSignUp).toHaveBeenCalledWith({
        ClientId: 'dummyClientId',
        ConfirmationCode: 'code',
        Username: 'username',
        SecretHash: expect.any(String),
      });
    });

    it('should throw an error when confirm sign up fails', async () => {
      cognitoIdentity.confirmSignUp = jest.fn().mockReturnValue({
        promise: jest
          .fn()
          .mockRejectedValue(new Error('Confirm sign up error')),
      });

      await expect(service.confirmSignUp('username', 'code')).rejects.toThrow(
        "Can't confirm sign up user",
      );
      expect(cognitoIdentity.confirmSignUp).toHaveBeenCalledWith({
        ClientId: 'dummyClientId',
        ConfirmationCode: 'code',
        Username: 'username',
        SecretHash: expect.any(String),
      });
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const signInResponse = {
        AuthenticationResult: { AccessToken: 'accessToken' },
      };
      cognitoIdentity.initiateAuth = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(signInResponse),
      });

      const response = await service.signIn('username', 'password');
      expect(response).toBe(signInResponse);
      expect(cognitoIdentity.initiateAuth).toHaveBeenCalledWith({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: 'dummyClientId',
        AuthParameters: {
          USERNAME: 'username',
          PASSWORD: 'password',
          SECRET_HASH: expect.any(String),
        },
      });
    });

    it('should throw an error when sign in fails', async () => {
      cognitoIdentity.initiateAuth = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Sign in error')),
      });

      await expect(service.signIn('username', 'password')).rejects.toThrow(
        "Can't sign in user",
      );
      expect(cognitoIdentity.initiateAuth).toHaveBeenCalledWith({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: 'dummyClientId',
        AuthParameters: {
          USERNAME: 'username',
          PASSWORD: 'password',
          SECRET_HASH: expect.any(String),
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out a user', async () => {
      const signOutResponse = {};
      cognitoIdentity.globalSignOut = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(signOutResponse),
      });

      const response = await service.signOut('accessToken');
      expect(response).toBe(signOutResponse);
      expect(cognitoIdentity.globalSignOut).toHaveBeenCalledWith({
        AccessToken: 'accessToken',
      });
    });

    it('should throw an error when sign out fails', async () => {
      cognitoIdentity.globalSignOut = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Sign out error')),
      });

      await expect(service.signOut('accessToken')).rejects.toThrow(
        "Can't sign out user",
      );
      expect(cognitoIdentity.globalSignOut).toHaveBeenCalledWith({
        AccessToken: 'accessToken',
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify access token', async () => {
      const verifyAccessTokenResponse = {
        UserAttributes: [
          { Name: 'jonathanfab92@gmail.com', Value: 'email' },
          { Name: 'name', Value: 'name' },
          { Name: 'email_verified', Value: 'true' },
        ],
      };
      cognitoIdentity.getUser = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(verifyAccessTokenResponse),
      });

      const response = await service.verifyAccessToken('accessToken');
      expect(response).toBe(verifyAccessTokenResponse);
      expect(cognitoIdentity.getUser).toHaveBeenCalledWith({
        AccessToken: 'accessToken',
      });
    });

    it('should throw an error when verifying access token fails', async () => {
      cognitoIdentity.getUser = jest.fn().mockReturnValue({
        promise: jest
          .fn()
          .mockRejectedValue(new Error('Verify access token error')),
      });

      await expect(service.verifyAccessToken('accessToken')).rejects.toThrow(
        "Can't verify access token",
      );
      expect(cognitoIdentity.getUser).toHaveBeenCalledWith({
        AccessToken: 'accessToken',
      });
    });
  });
});
