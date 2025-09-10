#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {Assignment1Stack} from '../lib/assignment1-stack';

const app = new cdk.App();
new Assignment1Stack(app, 'Assignment1Stack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
});