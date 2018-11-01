# Usage with minikube

First of all start minikube on your machine:
```sh
minikube start
```

Build your Docker image, using the Minikube Docker daemon:
```sh
eval $(minikube docker-env)
docker build -t humanconnection/backend:latest .
```

check that the image is in Minikube’s Docker registry:
```sh
minikube ssh docker images 
```

Now change into directory kubernetes and create services and deployments:
```sh
cd kubernetes

kubectl create -f backend-deployment.yaml neo4j-deployment.yaml neo4j-data-persistentvolumeclaim.yaml

# expose the backend deployment
kubectl expose backend hello-node --type=LoadBalancer

# and create the services
kubectl create -f backend-service.yaml neo4j-service.yaml
```

You can see the backend in action with
```sh
minikube service backend
```



