# Usage with minikube

assuming you installed the packages minikube and virtualbox here...

First of all start minikube on your machine:
```sh
minikube start
```
If you get an error message along th lines of 'The vboxdrv kernel module is not loaded.' - then you have the same issue i had. to solve this you need to install the propper linux kernel host modules package. Here an example for Manjaro:
https://forum.manjaro.org/t/installing-virtualbox-kernel-modules/6999

You can always get an overview and see what's going on with your minikube:
```sh
minikube dashboard
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

kubectl create -f neo4j-deployment.yaml,neo4j-data-persistentvolumeclaim.yaml,backend-deployment.yaml,neo4j-service.json,backend-service.json
```

You can see the backend in action with:
```sh
minikube service backend
```



