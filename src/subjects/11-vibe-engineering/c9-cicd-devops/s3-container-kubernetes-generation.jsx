import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ContainerKubernetesGeneration() {
  return (
    <article className="prose-content">
      <h1>Container and Kubernetes Generation</h1>

      <p>
        Containerization and Kubernetes manifest authoring are areas where Claude provides
        particularly high leverage: the patterns are well-established, the security best
        practices are documented, and the boilerplate is extensive. A production-grade
        Dockerfile with multi-stage builds, non-root user, minimal attack surface, and
        health checks takes an experienced engineer 30-60 minutes. Claude generates it
        in minutes and can scan it with Hadolint and Trivy before you review.
      </p>

      <p>
        The discipline is in the review and the constraints. A Docker image that runs
        as root, contains a full development toolchain in the production image, or leaks
        secrets in build args will pass CI if you don't have a scanner in the loop.
        Vibe Engineering puts container scanning in the pre-commit and CI gates.
      </p>

      <ConceptBlock title="Production Dockerfile Requirements">
        A production-ready Dockerfile must: use a specific base image version (not
        <code>:latest</code>), use multi-stage builds to minimize image size, run as
        a non-root user (UID &gt; 1000), set a read-only root filesystem where possible,
        not include development tools (npm, pip, gcc) in the production stage, not
        copy .env files or secrets into the image, and include a proper HEALTHCHECK
        instruction.
      </ConceptBlock>

      <SDKExample
        title="Production Dockerfile Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-dockerfile.sh',
            code: `# Generate a production Dockerfile
claude "Generate a production-ready Dockerfile for our Node.js TypeScript API.

Application: Express.js API
- Build: npm run build (TypeScript → dist/)
- Runtime: node dist/server.js
- Port: 3000
- Requires: Node.js 20
- Runtime dependencies: node_modules (production only)
- Health check endpoint: GET /health (returns 200)

Security requirements:
- Multi-stage build (build stage + production stage)
- Production stage must be based on node:20-alpine (minimal attack surface)
- Non-root user: create user 'appuser' with UID 1001
- No development dependencies in production image
- No .env files copied into image
- Read-only filesystem: app writes to /tmp only (use tmpfs in K8s)
- HEALTHCHECK using curl or wget

After generating:
1. Run: hadolint Dockerfile (must pass with 0 errors)
2. Build: docker build -t payment-api:test .
3. Run: trivy image payment-api:test --exit-code 1 --severity HIGH,CRITICAL
4. Fix any findings from trivy (update base image or patch packages)
5. Run: docker run --user 1001 --read-only payment-api:test — verify starts successfully"`,
          },
          {
            label: 'docker',
            language: 'dockerfile',
            filename: 'Dockerfile (generated)',
            code: `# Build stage
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Prune to production dependencies only
RUN npm prune --production

# Production stage — minimal image
FROM node:20-alpine3.19 AS production

# Security: create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy only what's needed for production
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# Set non-root user
USER appuser

# Application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]`,
          },
        ]}
      />

      <h2>Kubernetes Manifest Generation</h2>

      <SDKExample
        title="Generating K8s Manifests"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-k8s.sh',
            code: `# Generate Kubernetes manifests for a service
claude "Generate production Kubernetes manifests for the payment-api service.

Service requirements:
- Image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/payment-api:latest
  (will be overridden by Kustomize per environment)
- Replicas: 2 minimum (HPA will manage up to 20)
- CPU request: 100m, limit: 500m
- Memory request: 128Mi, limit: 512Mi
- Port: 3000
- Health checks: /health (liveness), /ready (readiness)
- Secrets: pulled from external-secrets operator (AWS Secrets Manager)
- Namespace: payment

Security requirements (all security contexts must be set):
- runAsNonRoot: true
- runAsUser: 1001
- readOnlyRootFilesystem: true
- allowPrivilegeEscalation: false
- capabilities: drop ALL
- Pod security standard: restricted

Workload requirements:
- PodDisruptionBudget: minAvailable 1
- HorizontalPodAutoscaler: CPU target 70%, min 2, max 20
- topologySpreadConstraints: spread across zones
- No hostNetwork, no hostPID
- ServiceAccount with no cluster-level permissions

After generating:
1. Run: kubectl apply --dry-run=client -f k8s/payment-api/
2. Run: kubesec scan k8s/payment-api/deployment.yaml
3. Run: kube-score score k8s/payment-api/
4. Fix any HIGH findings

Generate to: k8s/payment-api/ (deployment.yaml, service.yaml, hpa.yaml, pdb.yaml, externalsecret.yaml)"`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'k8s/payment-api/deployment.yaml (generated)',
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
  namespace: payment
  labels:
    app: payment-api
    version: "1.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payment-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime deployments
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      serviceAccountName: payment-api
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: payment-api
      containers:
        - name: payment-api
          image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/payment-api:latest
          ports:
            - containerPort: 3000
              protocol: TCP
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: [ALL]
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: tmp
              mountPath: /tmp  # Required for read-only root filesystem
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          envFrom:
            - secretRef:
                name: payment-api-secrets  # From ExternalSecret
      volumes:
        - name: tmp
          emptyDir: {}`,
          },
        ]}
      />

      <h2>Helm Chart Generation</h2>

      <SDKExample
        title="Converting Manifests to Helm Charts"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-helm.sh',
            code: `# Convert K8s manifests to a Helm chart
claude "Convert the Kubernetes manifests in k8s/payment-api/ into a Helm chart.

The chart should:
1. Parameterize all environment-specific values in values.yaml:
   - image.repository, image.tag
   - replicaCount
   - resources.requests/limits (with production defaults)
   - autoscaling.enabled, minReplicas, maxReplicas, targetCPUUtilizationPercentage
   - environment (dev/staging/production)
   
2. Include separate values files per environment:
   - values.yaml (base defaults)
   - values-staging.yaml (staging overrides)  
   - values-production.yaml (production overrides with higher limits)

3. Hardcode security context values (these must never change):
   - runAsNonRoot: true
   - readOnlyRootFilesystem: true
   - capabilities.drop: [ALL]
   # These are security requirements, not configuration

4. Include chart tests (helm test):
   - Test that /health returns 200
   - Test that /ready returns 200

Create: helm/payment-api/
Validate: helm lint helm/payment-api/
Template: helm template payment-api helm/payment-api/ --values helm/payment-api/values-staging.yaml | kubectl apply --dry-run=client -f -"`,
          },
        ]}
      />

      <WarningBlock title="Never Set Latest as Image Tag in Production">
        The <code>:latest</code> tag in Kubernetes is not deterministic — it resolves to
        whatever was most recently pushed to the registry, which changes with every deployment
        to every environment. Production manifests must use a specific, immutable image tag
        (a git commit SHA or a semantic version). In CLAUDE.md: "Kubernetes production
        manifests must never use image tag :latest. Use the Git commit SHA as the image tag.
        CI/CD will inject the correct tag via Kustomize or Helm <code>--set image.tag={"{'${{ github.sha }}'}"}</code>."
      </WarningBlock>

      <BestPracticeBlock title="kube-score for Policy Enforcement">
        kube-score analyzes Kubernetes manifests against a set of best practices and security
        policies, similar to Checkov for Terraform. Run it in CI on any PR that changes
        K8s manifests: <code>kube-score score k8s/**/*.yaml</code>. Common findings it
        catches: missing resource limits (causing noisy-neighbor problems), missing
        pod disruption budgets (causing downtime during node drains), missing readiness
        probes (causing traffic to unhealthy pods), and missing security contexts.
        Ask Claude to fix any kube-score findings before manifests are reviewed.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Trivy for Container Vulnerability Scanning">
        Trivy scans Docker images for OS package vulnerabilities, language package
        vulnerabilities, and secret exposure. Integrate it into your CI pipeline:
        <code>trivy image --exit-code 1 --severity HIGH,CRITICAL your-image:tag</code>.
        When Trivy reports HIGH or CRITICAL vulnerabilities, ask Claude to fix them:
        "Trivy found HIGH vulnerabilities in the base image node:20-alpine3.18. The
        fixed version is alpine3.19. Update the Dockerfile to use node:20-alpine3.19
        and re-run Trivy to verify the vulnerabilities are resolved."
      </NoteBlock>
    </article>
  )
}
