import {
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cognitoClient, clientId } from "./client";

const app = new Hono();

app.get("/", async (c) => {
  return c.json({
    message: "Hello World",
  });
});

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  if (!clientId) {
    return c.json({ error: "Server misconfiguration" }, 500);
  }

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }),
    );

    return c.json({
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      username: username,
    });
  } catch (error) {
    return c.json({ error: "Authentication failed" }, 401);
  }
});

app.post("/register", async (c) => {
  const { username, password, email } = await c.req.json();
  if (!clientId) {
    return c.json({ error: "Server misconfiguration" }, 500);
  }

  try {
    await cognitoClient.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
        ],
      }),
    );

    return c.json({ message: "User registered successfully" }, 201);
  } catch (error) {
    return c.json({ error: "Registration failed" }, 400);
  }
});

app.get("/good", async (c) => {
  const username = c.req.query("username");
  
  if (!username) {
    return c.redirect("/bad");
  }
  
  return c.json({
    message: "Hello User",
    username: username,
  });
});

app.get("/bad", async (c) => {
  return c.json({
    message: "The flop.",
  });
});

export const handler = handle(app);
