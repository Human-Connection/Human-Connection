# Usage with minikube
Assuming you installed the packages git, docker ([all-distributions](https://docs.docker.com/install/)), minikube ([ubuntu]([minikube](https://computingforgeeks.com/how-to-install-minikube-on-ubuntu-18-04/)), [all-distributions](https://kubernetes.io/docs/tasks/tools/install-minikube/)) and virtualbox here...

First of all start minikube on your machine:
```sh
minikube start
```

You can always get an overview and see what's going on with your minikube:
```sh
minikube dashboard
```

From now on stay in your favorite work directory. First let's clone the necessary sources:
```sh
git clone https://github.com/Human-Connection/Nitro-Backend.git
git clone https://github.com/Human-Connection/Nitro-Web.git
```

Build Docker images, using the Minikube Docker daemon:
```sh
eval $(minikube docker-env)
docker build -t humanconnection/nitro-backend:latest Nitro-Backend/
docker build -t humanconnection/neo4j:latest -f Nitro-Backend/Dockerfile.neo4j Nitro-Backend/
```

Check that the image is in Minikube’s Docker registry:
```sh
minikube ssh docker images 
```

Now change into directory Nitro-Backend/kubernetes and create services and deployments:
```sh
cd Nitro-Backend/kubernetes
kubectl create -f neo4j-deployment.yaml,neo4j-data-persistentvolumeclaim.yaml,backend-deployment.yaml,neo4j-service.json,backend-service.json
```

You can see the backend in action with:
```sh
minikube service backend
```

### Troubleshoot

1. If you get an error message along th lines of 'The vboxdrv kernel module is not loaded.' - then you have the same issue i had. to solve this you need to install the propper linux kernel host modules package. Here an example for Manjaro:  
https://forum.manjaro.org/t/installing-virtualbox-kernel-modules/6999  
2. When you can not start minikube, try also to remove the cluster with `minikube delete` and start again with `minikube start`. Sometimes this fix startup problems of the cluster.   
3. Now again you might run into trouble with an error like 'kubectl could not be found on your path.' In this case run the following command:
    ```sh
    curl -Lo kubectl https://storage.googleapis.com/kubernetes-release/release/v1.10.0/bin/linux/amd64/kubectl && chmod +x kubectl && sudo cp kubectl /usr/local/bin/ && rm kubectl
    ```
