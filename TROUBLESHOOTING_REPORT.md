Issue 1: Backend Could Not Connect to Redis and MongoDB
Error: getaddrinfo ENOTFOUND redis
MongooseServerSelectionError: getaddrinfo ENOTFOUND mongo

Root Cause-Backend container was running outside Docker network.

Resolution

Created Docker bridge network: docker network create shopfast-network

Started MongoDB and Redis in same network:

docker run -d --name mongo --network shopfast-network mongo

docker run -d --name redis --network shopfast-network redis

Started backend in same network:

docker run -d --name backend \
--network shopfast-network \
-p 5001:5000 \
shopfast/backend:v1

Result

Backend connected successfully to MongoDB and Redis.

Issue 2: Docker Compose Port Conflict
Error
Bind for 0.0.0.0:6379 failed
port is already allocated

Root Cause

Redis already running locally.

Resolution

Stopped existing container:

docker stop redis
docker rm redis

Restarted compose stack:

docker compose up -d
Result

Docker Compose deployed successfully.

Issue 3: Kubernetes Pods Failed to Start
Error
ErrImageNeverPull
Root Cause

Kubernetes cluster could not access locally built images.

Resolution

Rebuilt images inside Docker Desktop image store and redeployed.

Verified images:

docker images | grep shopfast
Result

Pods started successfully.

Issue 4: Frontend Could Not Reach Backend
Troubleshooting Steps
kubectl get endpoints -n shopfast

kubectl describe service backend -n shopfast

kubectl logs -l app=backend -n shopfast
DNS Verification
kubectl run dns-test \
-n shopfast \
--image=busybox:1.36 \
--rm -it --restart=Never \
-- nslookup backend.shopfast.svc.cluster.local
Result

DNS and service discovery working correctly.

Issue 5: Payment Service Health Check Failure
Root Cause

Flask service did not expose /health.

Resolution

Added:

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })
Result

Pod became healthy.

Issue 6: Kubernetes Secret Volume Not Mounted
Error
ls: /etc/secrets: No such file or directory
Resolution

Added:

volumeMounts:
- name: shopfast-secret-volume
  mountPath: /etc/secrets

volumes:
- name: shopfast-secret-volume
  secret:
    secretName: shopfast-secret

Verified:

kubectl exec -it <backend-pod> -n shopfast -- ls /etc/secrets

Output:

mongo-uri
redis-uri
Result

Secrets mounted successfully.

Deliverable 5: Optimization Changes
High Availability
Backend replicas = 2
Frontend replicas = 2
Payment Service replicas = 2
Resource Management
requests:
  cpu: 200m
  memory: 256Mi

limits:
  cpu: 500m
  memory: 512Mi
Affinity Rules

Backend prefers frontend zone:

podAffinity
Anti-Affinity Rules

Redis avoids MongoDB node:

podAntiAffinity
Horizontal Pod Autoscaler
minReplicas: 2
maxReplicas: 5
targetCPUUtilizationPercentage: 70
Persistent Storage

MongoDB StatefulSet with PVC:

mongo-storage-mongo-0 Bound 1Gi
Canary Deployment
payment-service:v1
payment-service:v2

Traffic split using:

DestinationRule
VirtualService
Security
Network Policies
Secrets mounted as volumes
ClusterIP for internal services

