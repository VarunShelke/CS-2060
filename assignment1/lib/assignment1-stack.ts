import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';

export class Assignment1Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC
        const vpc = new ec2.Vpc(this, 'VirtLabVPC', {
            maxAzs: 1
        });

        // Security Group for SSH access
        const securityGroup = new ec2.SecurityGroup(this, 'VirtLabSG', {
            vpc: vpc,
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
            machineImage: ec2.MachineImage.genericLinux({
                'us-east-1': 'ami-0bbdd8c17ed981ef9',
            }),
            vpc: vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            securityGroup: securityGroup,
            keyPair: keyPair,
            blockDevices: [
                {
                    deviceName: '/dev/sda1',
                    volume: ec2.BlockDeviceVolume.ebs(20, {
                        volumeType: ec2.EbsDeviceVolumeType.GP3
                    })
                }
            ]
        });

        // Outputs
        new cdk.CfnOutput(this, 'InstanceId', {value: instance.instanceId});
        new cdk.CfnOutput(this, 'PublicIP', {value: instance.instancePublicDnsName});
        new cdk.CfnOutput(this, 'SSHCommand', {
            value: `ssh -i virt-lab-key.pem ubuntu@${instance.instancePublicDnsName}`
        });
    }
}
