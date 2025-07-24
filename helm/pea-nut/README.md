# PeaNUT Helm Chart

A Helm chart for deploying PeaNUT (A tiny dashboard for Network UPS Tools) in Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+

## Installation

### Add the Helm repository (if available)

```bash
helm repo add pea-nut https://your-repo-url
helm repo update
```

### Install the chart

```bash
# Install with default values
helm install pea-nut ./helm/pea-nut

# Install with custom values
helm install pea-nut ./helm/pea-nut -f custom-values.yaml

# Install in a specific namespace
helm install pea-nut ./helm/pea-nut --namespace monitoring --create-namespace
```

## Configuration

### Basic Configuration

The following table lists the configurable parameters of the PeaNUT chart and their default values.

#### Port Configuration

PeaNUT uses two different port configurations:

- **`service.port`**: The external port exposed by the Kubernetes service (default: `80`)
- **`containerPort`**: The internal port the application listens on (default: `8080`)

The `WEB_PORT` environment variable is automatically set to match the `containerPort` value, ensuring the application listens on the correct internal port.

| Parameter          | Description                         | Default                      |
| ------------------ | ----------------------------------- | ---------------------------- |
| `replicaCount`     | Number of PeaNUT replicas           | `1`                          |
| `image.repository` | PeaNUT image repository             | `brandawg93/peanut`          |
| `image.tag`        | PeaNUT image tag                    | `""` (uses Chart.AppVersion) |
| `image.pullPolicy` | Image pull policy                   | `IfNotPresent`               |
| `service.type`     | Kubernetes service type             | `ClusterIP`                  |
| `service.port`     | Kubernetes service port             | `80`                         |
| `containerPort`    | Container internal port             | `8080`                       |
| `ingress.enabled`  | Enable ingress                      | `false`                      |
| `resources`        | CPU/Memory resource requests/limits | `{}`                         |

### Authentication Configuration

PeaNUT supports basic authentication using username and password.

```yaml
env:
  # Authentication
  WEB_USERNAME: 'admin'
  AUTH_SECRET: 'your-auth-secret-here' # Optional, auto-generated if not provided

secrets:
  WEB_PASSWORD: 'your-secure-password'
```

### NUT Server Configuration

You can configure NUT servers in two ways:

#### Method 1: Single NUT Server (Legacy)

```yaml
env:
  # Single NUT server configuration
  NUT_HOST: 'nut-server.local'
  NUT_PORT: '3493'
  USERNAME: 'observer'
  PASSWORD: 'secret-password'
```

#### Method 2: Multiple NUT Servers (Recommended)

```yaml
nutServers:
  - HOST: 'nut-server1.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password1'
  - HOST: 'nut-server2.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password2'
```

### InfluxDB Configuration

Configure InfluxDB for metrics storage and visualization:

```yaml
env:
  # InfluxDB configuration
  INFLUX_HOST: 'http://influxdb:8086'
  INFLUX_ORG: 'home'
  INFLUX_BUCKET: 'ups'
  INFLUX_INTERVAL: 10 # Data collection interval in seconds

secrets:
  INFLUX_TOKEN: 'your-influxdb-token'
```

### Application Configuration

```yaml
env:
  # Web server configuration
  WEB_HOST: '0.0.0.0'

  # Application settings
  DISABLE_CONFIG_FILE: 'false' # Set to "true" to disable config file saving

  # Next.js configuration
  NODE_ENV: 'production'
  NEXT_TELEMETRY_DISABLED: '1'
  ANALYZE: 'false' # Enable bundle analysis
  BASE_PATH: '' # Application base path
```

### Complete Example

Here's a complete example configuration:

```yaml
# values.yaml
replicaCount: 1

image:
  repository: brandawg93/peanut
  tag: 'latest'
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

# Container port configuration
containerPort: 8080

ingress:
  enabled: true
  className: 'nginx'
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: pea-nut.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: pea-nut-tls
      hosts:
        - pea-nut.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

# Environment variables
env:
  # Authentication
  WEB_USERNAME: 'admin'
  AUTH_SECRET: 'your-super-secret-auth-key'

  # Web server
  WEB_HOST: '0.0.0.0'

  # NUT servers (legacy single server)
  NUT_HOST: 'nut-server.local'
  NUT_PORT: '3493'
  USERNAME: 'observer'
  PASSWORD: 'secret-password'

  # InfluxDB
  INFLUX_HOST: 'http://influxdb:8086'
  INFLUX_ORG: 'home'
  INFLUX_BUCKET: 'ups'
  INFLUX_INTERVAL: 10

  # Application
  DISABLE_CONFIG_FILE: 'false'
  NODE_ENV: 'production'
  NEXT_TELEMETRY_DISABLED: '1'

# Multiple NUT servers (alternative to single server config)
nutServers:
  - HOST: 'nut-server1.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password1'
  - HOST: 'nut-server2.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password2'

# Secrets
secrets:
  WEB_PASSWORD: 'your-secure-password'
  INFLUX_TOKEN: 'your-influxdb-token'
```

## Validation

The Helm chart includes validation to ensure required configuration is provided:

- **Authentication**: If `WEB_USERNAME` is provided, `WEB_PASSWORD` must also be provided
- **NUT Servers**: Either `NUT_HOST`/`NUT_PORT` or `nutServers` array must be configured
- **InfluxDB**: If `INFLUX_HOST` is provided, `INFLUX_TOKEN`, `INFLUX_ORG`, and `INFLUX_BUCKET` must also be provided

## Deployment Examples

### Basic Deployment

```bash
helm install pea-nut ./helm/pea-nut \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123 \
  --set env.NUT_HOST=nut-server.local \
  --set env.NUT_PORT=3493
```

### With InfluxDB

```bash
helm install pea-nut ./helm/pea-nut \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123 \
  --set env.INFLUX_HOST=http://influxdb:8086 \
  --set env.INFLUX_ORG=home \
  --set env.INFLUX_BUCKET=ups \
  --set secrets.INFLUX_TOKEN=your-token
```

### With Ingress

```bash
helm install pea-nut ./helm/pea-nut \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=pea-nut.example.com \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123
```

## Troubleshooting

### Common Issues

1. **Authentication not working**: Ensure both `WEB_USERNAME` and `WEB_PASSWORD` are set
2. **Can't connect to NUT servers**: Verify NUT server configuration and network connectivity
3. **InfluxDB connection failed**: Check InfluxDB credentials and network connectivity
4. **High memory usage**: Adjust resource limits in the values file

### Checking Logs

```bash
# Get pod name
kubectl get pods -l app.kubernetes.io/name=pea-nut

# Check logs
kubectl logs <pod-name>

# Check logs with follow
kubectl logs -f <pod-name>
```

### Checking Configuration

```bash
# Get the deployed values
helm get values pea-nut

# Test the chart rendering
helm template pea-nut ./helm/pea-nut
```

## Upgrading

```bash
# Upgrade to a new version
helm upgrade pea-nut ./helm/pea-nut

# Upgrade with new values
helm upgrade pea-nut ./helm/pea-nut -f new-values.yaml
```

## Uninstalling

```bash
helm uninstall pea-nut
```

## Contributing

When contributing to this Helm chart, please ensure:

1. All new environment variables are documented
2. Validation rules are updated if needed
3. Examples are provided for new features
4. Chart version is incremented appropriately

## License

This Helm chart is licensed under the same license as PeaNUT (Apache 2.0).
