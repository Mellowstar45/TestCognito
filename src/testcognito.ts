import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"

export interface TestcognitoProps extends cdk.StackProps {
  serviceName: string;
  stage: string;
}

export class Testcognito extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestcognitoProps) {
    super(scope, id, props)
    // Add your infra here...
  }
}
