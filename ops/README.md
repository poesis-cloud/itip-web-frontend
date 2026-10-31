# oip-web-frontend deployables

This folder contains ops/runtime assets for the oip-web-frontend service.

- `ops/helm/`: Helm chart for Kubernetes deployments (dev/preprod/prod)

## Helm

Chart path: `ops/helm`

Install with defaults:

```bash
helm upgrade --install oip-web-frontend \
  ./ops/helm \
  -n poesis --create-namespace
```

Environment values:

- `environments/dev/values.yaml`
- `environments/preprod/values.yaml`
- `environments/prod/values.yaml`

Each environment file is self-contained and carries the chart defaults for that target environment.

Recommended deploy command:

```bash
helm upgrade --install oip-web-frontend \
  ./ops/helm \
  -n poesis --create-namespace \
  -f ./ops/helm/environments/preprod/values.yaml
```

## Dev deployment

Use `make dev-up` from `oip-web-frontend` to deploy the service to your local cluster.
The dev values default `runtime.apiBaseUrl` to `http://localhost:8080`, so keep the backend reachable there
(for example via local backend run or backend port-forward).

```bash
cd oip-web-frontend && make dev-check
cd oip-web-frontend && make dev-up
cd oip-web-frontend && make run-ui
```

Stop:

```bash
cd oip-web-frontend && make dev-down
```
