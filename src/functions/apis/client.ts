import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const defaultRegion = "eu-north-1";
export const cognitoClient = new CognitoIdentityProviderClient({
  region: defaultRegion,
});
export const userPoolId = process.env.USER_POOL_ID!;
export const clientId = process.env.COGNITO_CLIENT_ID!;

export const getUserPoolId = () => userPoolId;
