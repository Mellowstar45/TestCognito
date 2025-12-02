import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ln from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface TestcognitoProps extends cdk.StackProps {
  serviceName: string;
  stage: string;
}

export class Testcognito extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestcognitoProps) {
    super(scope, id, props);
    // Add your infra here...
    const api = new apigw.HttpApi(this, "TransferApi", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowOrigins: ["*"],
      },
    });

    const apiFunction = new ln.NodejsFunction(this, "ApiFunction", {
      entry: `${__dirname}/functions/apis/index.ts`,
      environment: {
        STAGE: props.stage,
        SERVICE: props.serviceName,
        NODE_OPTIONS: "--enable-source-maps",
      },
      bundling: { minify: true, sourceMap: true },
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      logRetention: logs.RetentionDays.THREE_DAYS,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });
    const apiIntegration = new integrations.HttpLambdaIntegration(
      "ApiIntegration",
      apiFunction
    );
    api.addRoutes({
      path: "/{proxy+}",
      methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
      integration: apiIntegration,
      // authorizer: undefined,
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "",
      description: "API URL",
    });
  }
}
