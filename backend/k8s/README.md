# Setting up EKS Cluster for Cybertrap Backend

This README provides instructions on how to set up an Amazon EKS (Elastic Kubernetes Service) cluster using eksctl for the Cybertrap backend.

## Prerequisites

1. Install eksctl: https://eksctl.io/installation/
2. Install AWS CLI and configure it with your credentials
3. Install kubectl: https://kubernetes.io/docs/tasks/tools/

## Creating the EKS Cluster

1. Create a basic EKS cluster:

```
eksctl create cluster \
--name cybertrap-cluster \
--region ap-southeast-1 \
--nodegroup-name standard-workers \
--node-type t3.small \
--nodes 3 \
--nodes-min 1 \
--nodes-max 4 \
--managed
```

2. update the aws eks update-kubeconfig

```
aws eks update-kubeconfig --name cybertrap-cluster --region ap-southeast-1
```

3. Check the nodes in the cluster

```
kubectl get nodes
```

4. Apply the deployment from k8s

```
kubectl apply -f domains-api-deployment.yaml
```

5. Check the pods in the cluster

```
kubectl get pods
```

