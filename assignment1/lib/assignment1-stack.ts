import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';

export class Assignment1Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Security Group for SSH access
        const securityGroup = new ec2.SecurityGroup(this, 'VirtLabSG', {
            vpc: ec2.Vpc.fromLookup(this, 'DefaultVPC', {isDefault: true}),
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH access');

        // Key Pair for SSH
        const keyPair = new ec2.KeyPair(this, 'VirtLabKeyPair', {
            keyPairName: 'virt-lab-key'
        });

        // EC2 Instance - Ubuntu 22.04 LTS t3.micro
        const instance = new ec2.Instance(this, 'VirtLabInstance', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.lookup({
                name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*',
                owners: ['099720109477']
            }),
            vpc: ec2.Vpc.fromLookup(this, 'VPC', {isDefault: true}),
            securityGroup: securityGroup,
            keyPair: keyPair
        });

        // Outputs
        new cdk.CfnOutput(this, 'InstanceId', {value: instance.instanceId});
        new cdk.CfnOutput(this, 'PublicIP', {value: instance.instancePublicIp});
        new cdk.CfnOutput(this, 'SSHCommand', {
            value: `ssh -i virt-lab-key.pem ubuntu@${instance.instancePublicIp}`
        });
    }
}
