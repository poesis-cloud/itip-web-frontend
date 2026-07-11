SHELL := /bin/bash
.EXPORT_ALL_VARIABLES:

.PHONY: dev-check dev-up dev-down run-ui deploy-check prod-deploy package-helm test verify

-include .env
-include .env.dev

NAMESPACE        ?= poesis
DEPLOY_ENV       ?= preprod
RELEASE          ?= itip-web-frontend

CHART            ?= ./ops/helm
ENV_FILE         ?= $(CHART)/environments/$(DEPLOY_ENV)/values.yaml

PORT_FORWARD_PID_FILE ?= .dev-port-forwards.pids
FRONTEND_PORT ?= 4200

dev-check:
	@command -v kubectl >/dev/null 2>&1 || { echo "Missing required command: kubectl"; exit 1; }
	@command -v helm    >/dev/null 2>&1 || { echo "Missing required command: helm";    exit 1; }
	@kubectl config current-context >/dev/null 2>&1 || { echo "No active Kubernetes context."; exit 1; }
	@kubectl get ns >/dev/null 2>&1 || { echo "Cannot reach Kubernetes API."; exit 1; }
	@test -d "$(CHART)" || { echo "Missing chart directory: $(CHART)"; exit 1; }
	@test -f "$(CHART)/environments/dev/values.yaml" || { echo "Missing dev values file"; exit 1; }
	@echo "dev-check passed"

deploy-check:
	@command -v kubectl >/dev/null 2>&1 || { echo "Missing required command: kubectl"; exit 1; }
	@command -v helm    >/dev/null 2>&1 || { echo "Missing required command: helm";    exit 1; }
	@kubectl config current-context >/dev/null 2>&1 || { echo "No active Kubernetes context."; exit 1; }
	@kubectl get ns >/dev/null 2>&1 || { echo "Cannot reach Kubernetes API."; exit 1; }
	@test -d "$(CHART)" || { echo "Missing chart directory: $(CHART)"; exit 1; }
	@test -f "$(ENV_FILE)" || { echo "Missing environment values file: $(ENV_FILE)"; exit 1; }
	@: "$${IMAGE_REPOSITORY:?Missing IMAGE_REPOSITORY in environment}"
	@: "$${IMAGE_TAG:?Missing IMAGE_TAG in environment}"
	@echo "deploy-check passed"

dev-up:
	kubectl get ns $(NAMESPACE) >/dev/null 2>&1 || kubectl create ns $(NAMESPACE) >/dev/null
	helm upgrade --install $(RELEASE) $(CHART) -n $(NAMESPACE) --create-namespace --wait --timeout 5m0s \
	-f $(CHART)/environments/dev/values.yaml \
	$${IMAGE_REPOSITORY:+--set image.repository=$${IMAGE_REPOSITORY}} \
	$${IMAGE_TAG:+--set image.tag=$${IMAGE_TAG}}
	@echo "itip-web-frontend deployed. Run: make run-ui"

dev-down:
	@if [[ -f "$(PORT_FORWARD_PID_FILE)" ]]; then \
		while IFS= read -r pid; do kill "$$pid" 2>/dev/null || true; done < "$(PORT_FORWARD_PID_FILE)"; \
		rm -f "$(PORT_FORWARD_PID_FILE)"; \
		echo "Stopped active port-forward sessions"; \
	fi
	helm uninstall $(RELEASE) -n $(NAMESPACE) || true

run-ui:
	@kubectl -n $(NAMESPACE) port-forward service/$(RELEASE) $(FRONTEND_PORT):80 >/dev/null 2>&1 & echo $$! >> "$(PORT_FORWARD_PID_FILE)"
	@echo "Frontend available on http://localhost:$(FRONTEND_PORT)"

prod-deploy:
	@$(MAKE) deploy-check
	helm upgrade --install $(RELEASE) $(CHART) -n $(NAMESPACE) --create-namespace --wait --timeout 10m0s \
	-f $(ENV_FILE) \
	--set image.repository="$${IMAGE_REPOSITORY}" \
	--set image.tag="$${IMAGE_TAG}"

package-helm:
	@command -v helm >/dev/null 2>&1 || { echo "Missing required command: helm"; exit 1; }
	@test -d "$(CHART)" || { echo "Missing chart directory: $(CHART)"; exit 1; }
	helm package $(CHART)

test:
	cd app && npm run test

verify:
	cd app && npm run build -- --configuration production
	cd app && npm run test
