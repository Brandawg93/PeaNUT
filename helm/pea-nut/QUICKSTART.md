# PeaNUT Helm Chart - Quick Start Guide

This guide provides quick examples for common PeaNUT deployment scenarios.

## Prerequisites

- Kubernetes cluster
- Helm 3.0+
- kubectl configured

## Basic Deployment

### 1. Simple Deployment (No Authentication)

```bash
# Install with minimal configuration
helm install pea-nut ./helm/pea-nut \
  --set env.NUT_HOST=nut-server.local \
  --set env.NUT_PORT=3493
```

### 2. With Authentication

```bash
# Install with basic authentication
helm install pea-nut ./helm/pea-nut \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123 \
  --set env.NUT_HOST=nut-server.local \
  --set env.NUT_PORT=3493
```

### 3. With InfluxDB

```bash
# Install with InfluxDB integration
helm install pea-nut ./helm/pea-nut \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123 \
  --set env.INFLUX_HOST=http://influxdb:8086 \
  --set env.INFLUX_ORG=home \
  --set env.INFLUX_BUCKET=ups \
  --set secrets.INFLUX_TOKEN=your-token
```

### 4. With Ingress

```bash
# Install with ingress enabled
helm install pea-nut ./helm/pea-nut \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=pea-nut.example.com \
  --set env.WEB_USERNAME=admin \
  --set secrets.WEB_PASSWORD=password123
```

## Using Values Files

### 1. Create a custom values file

```yaml
# my-values.yaml
env:
  WEB_USERNAME: 'admin'
  NUT_HOST: 'nut-server.local'
  NUT_PORT: '3493'
  INFLUX_HOST: 'http://influxdb:8086'
  INFLUX_ORG: 'home'
  INFLUX_BUCKET: 'ups'

secrets:
  WEB_PASSWORD: 'password123'
  INFLUX_TOKEN: 'your-token'

ingress:
  enabled: true
  hosts:
    - host: pea-nut.example.com
      paths:
        - path: /
          pathType: Prefix
```

### 2. Install using the values file

```bash
helm install pea-nut ./helm/pea-nut -f my-values.yaml
```

## Multiple NUT Servers

```yaml
# multi-nut-values.yaml
nutServers:
  - HOST: 'nut-server1.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password1'
  - HOST: 'nut-server2.local'
    PORT: 3493
    USERNAME: 'observer'
    PASSWORD: 'password2'

env:
  WEB_USERNAME: 'admin'

secrets:
  WEB_PASSWORD: 'password123'
```

## Common Commands

### Check deployment status

```bash
kubectl get pods -l app.kubernetes.io/name=pea-nut
```

### View logs

```bash
kubectl logs -l app.kubernetes.io/name=pea-nut
```

### Access the application

```bash
# Port forward to access locally
kubectl port-forward svc/pea-nut 8080:80

# Then visit http://localhost:8080
```

### Upgrade deployment

```bash
helm upgrade pea-nut ./helm/pea-nut -f my-values.yaml
```

### Uninstall

```bash
helm uninstall pea-nut
```

## Troubleshooting

### Check if validation passed

```bash
# Test chart rendering
helm template pea-nut ./helm/pea-nut -f my-values.yaml
```

### Common validation errors

- `WEB_USERNAME is set but WEB_PASSWORD is not provided`: Add password to secrets
- `Either NUT_HOST/NUT_PORT or nutServers array must be configured`: Configure NUT servers
- `INFLUX_HOST is set but INFLUX_ORG is not provided`: Add missing InfluxDB configuration

### Check application logs

```bash
kubectl logs -l app.kubernetes.io/name=pea-nut --tail=100 -f
```

## Next Steps

- Read the full [README.md](README.md) for detailed configuration options
- Check [values-example.yaml](values-example.yaml) for all available settings
- Visit the [PeaNUT documentation](https://github.com/Brandawg93/PeaNUT) for application features
