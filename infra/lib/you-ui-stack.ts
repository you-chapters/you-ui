import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

interface YouUiStackProps extends cdk.StackProps {
  domainName: string;
}

export class YouUiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: YouUiStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'YouUiStaticAssets', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const certificate = new acm.Certificate(this, 'YouUiTlsCertificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(),
    });

    const distribution = new cloudfront.Distribution(this, 'YouUiCdnDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      domainNames: [props.domainName],
      certificate,
      defaultRootObject: 'index.html',
      // Return index.html for all 403/404s so React Router handles routing client-side
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });

    new s3deploy.BucketDeployment(this, 'YouUiDeployment', {
      sources: [s3deploy.Source.asset('../ui/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName,
      description: 'Add a CNAME record at GoDaddy pointing your domain to this value',
    });
  }
}