#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { YouUiStack } from '../lib/you-ui-stack';

const app = new cdk.App();

const domainName = app.node.tryGetContext('domainName') as string;
if (!domainName) {
  throw new Error('Set domainName in cdk.json context before deploying');
}

new YouUiStack(app, 'YouUiStack', {
  domainName,
  // ACM certs used by CloudFront must be in us-east-1
  env: { region: 'us-east-1' },
});