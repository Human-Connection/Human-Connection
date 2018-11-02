# Usage with minikube

First of all start minikube on your machine:
```sh
minikube start
```

Build Docker images, using the Minikube Docker daemon:
```sh
eval $(minikube docker-env)
docker build -t humanconnection/backend:latest .
docker build -t humanconnection/neo4j:latest -f Dockerfile.neo4j .
```

check that the image is in Minikube’s Docker registry:
```sh
minikube ssh docker images 
```

Now change into directory kubernetes and create services and deployments:
```sh
cd kubernetes

kubectl create -f neo4j-deployment.yaml,neo4j-data-persistentvolumeclaim.yaml,backend-deployment.yaml,backend-service.yaml,neo4j-service.yaml

# expose the backend deployment
kubectl expose deployment backend --type=LoadBalancer
# opionally expose the neo4j deployment
kubectl expose deployment neo4j --type=LoadBalancer
```

You can see the backend in action with:
```sh
minikube service backend
```
Get an overview with your minikube dashboard:
```sh
minikube dashboard
```



