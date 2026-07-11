# itip-web-frontend deployables

This folder contains ops/runtime assets for the itip-web-frontend service.

- `ops/helm/`: Helm chart for Kubernetes deployments (dev/preprod/prod)

## Helm

Chart path: `ops/helm`

Install with defaults:

```bash
helm upgrade --install itip-web-frontend \
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
helm upgrade --install itip-web-frontend \
  ./ops/helm \
  -n poesis --create-namespace \
  -f ./ops/helm/environments/preprod/values.yaml
```

## Dev deployment

Use `make dev-up` from `itip-web-frontend` to deploy the service to your local cluster.

```bash
cd itip-web-frontend && make dev-check
cd itip-web-frontend && make dev-up
cd itip-web-frontend && make run-ui
```

Stop:

```bash
cd itip-web-frontend && make dev-down
```
