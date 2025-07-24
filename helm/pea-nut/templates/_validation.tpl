{{/*
Validation template for PeaNUT Helm chart
This template provides validation rules for required configuration
*/}}

{{- define "pea-nut.validate" -}}
{{- $errors := list -}}

{{/* Validate authentication configuration */}}
{{- if and .Values.env.WEB_USERNAME (ne .Values.env.WEB_USERNAME "") -}}
  {{- if not .Values.secrets.WEB_PASSWORD -}}
    {{- $errors = append $errors "WEB_USERNAME is set but WEB_PASSWORD is not provided in secrets" -}}
  {{- end -}}
{{- end -}}

{{/* Validate NUT server configuration */}}
{{- $hasNutHost := and .Values.env.NUT_HOST (ne .Values.env.NUT_HOST "") -}}
{{- $hasNutPort := and .Values.env.NUT_PORT (ne .Values.env.NUT_PORT "") -}}
{{- $hasNutServers := and .Values.nutServers (gt (len .Values.nutServers) 0) -}}
{{- if and $hasNutHost $hasNutPort -}}
  {{- $port := 0 -}}
  {{- if kindIs "string" .Values.env.NUT_PORT -}}
    {{- $port = atoi .Values.env.NUT_PORT -}}
  {{- else if kindIs "int" .Values.env.NUT_PORT -}}
    {{- $port = .Values.env.NUT_PORT -}}
  {{- else -}}
    {{- $errors = append $errors "NUT_PORT must be a string or number" -}}
  {{- end -}}
  {{- if or (lt $port 1) (gt $port 65535) -}}
    {{- $errors = append $errors "NUT_PORT must be a valid port number between 1 and 65535" -}}
  {{- end -}}
{{- else if not $hasNutServers -}}
  {{- $errors = append $errors "Either NUT_HOST/NUT_PORT or nutServers array must be configured" -}}
{{- end -}}

{{/* Validate InfluxDB configuration */}}
{{- if and .Values.env.INFLUX_HOST (ne .Values.env.INFLUX_HOST "") -}}
  {{- if not .Values.env.INFLUX_ORG -}}
    {{- $errors = append $errors "INFLUX_HOST is set but INFLUX_ORG is not provided" -}}
  {{- end -}}
  {{- if not .Values.env.INFLUX_BUCKET -}}
    {{- $errors = append $errors "INFLUX_HOST is set but INFLUX_BUCKET is not provided" -}}
  {{- end -}}
  {{- if and (not .Values.env.INFLUX_TOKEN) (not .Values.secrets.INFLUX_TOKEN) -}}
    {{- $errors = append $errors "INFLUX_HOST is set but INFLUX_TOKEN is not provided in env or secrets" -}}
  {{- end -}}
  {{- if .Values.env.INFLUX_INTERVAL -}}
    {{- if not (kindIs "string" .Values.env.INFLUX_INTERVAL) -}}
      {{- $errors = append $errors "INFLUX_INTERVAL must be a string" -}}
    {{- else -}}
      {{- $interval := atoi .Values.env.INFLUX_INTERVAL -}}
      {{- if or (eq $interval 0) (lt $interval 1) -}}
        {{- $errors = append $errors "INFLUX_INTERVAL must be a valid positive number" -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}

{{/* Validate nutServers array if provided */}}
{{- if .Values.nutServers -}}
  {{- if not (kindIs "slice" .Values.nutServers) -}}
    {{- $errors = append $errors "nutServers must be an array" -}}
  {{- else if gt (len .Values.nutServers) 0 -}}
    {{- range $index, $server := .Values.nutServers -}}
      {{- if not (kindIs "map" $server) -}}
        {{- $errors = append $errors (printf "nutServers[%d] must be an object" $index) -}}
      {{- else -}}
        {{- if not $server.HOST -}}
          {{- $errors = append $errors (printf "nutServers[%d].HOST is required" $index) -}}
        {{- end -}}
        {{- if not $server.PORT -}}
          {{- $errors = append $errors (printf "nutServers[%d].PORT is required" $index) -}}
        {{- else if not (kindIs "int" $server.PORT) -}}
          {{- $errors = append $errors (printf "nutServers[%d].PORT must be a number" $index) -}}
        {{- else if or (eq $server.PORT 0) (lt $server.PORT 1) (gt $server.PORT 65535) -}}
          {{- $errors = append $errors (printf "nutServers[%d].PORT must be between 1 and 65535" $index) -}}
        {{- end -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}

{{/* Validate service port */}}
{{- if not (kindIs "int" .Values.service.port) -}}
  {{- $errors = append $errors "service.port must be a number" -}}
{{- else if or (eq .Values.service.port 0) (lt .Values.service.port 1) (gt .Values.service.port 65535) -}}
  {{- $errors = append $errors "service.port must be between 1 and 65535" -}}
{{- end -}}

{{/* Validate replica count */}}
{{- if not (kindIs "int" .Values.replicaCount) -}}
  {{- $errors = append $errors "replicaCount must be a number" -}}
{{- else if lt .Values.replicaCount 1 -}}
  {{- $errors = append $errors "replicaCount must be at least 1" -}}
{{- end -}}

{{/* Validate autoscaling configuration */}}
{{- if .Values.autoscaling.enabled -}}
  {{- if not (kindIs "int" .Values.autoscaling.minReplicas) -}}
    {{- $errors = append $errors "autoscaling.minReplicas must be a number" -}}
  {{- else if lt .Values.autoscaling.minReplicas 1 -}}
    {{- $errors = append $errors "autoscaling.minReplicas must be at least 1" -}}
  {{- end -}}
  {{- if not (kindIs "int" .Values.autoscaling.maxReplicas) -}}
    {{- $errors = append $errors "autoscaling.maxReplicas must be a number" -}}
  {{- else if lt .Values.autoscaling.maxReplicas 1 -}}
    {{- $errors = append $errors "autoscaling.maxReplicas must be at least 1" -}}
  {{- end -}}
  {{- if and (kindIs "int" .Values.autoscaling.minReplicas) (kindIs "int" .Values.autoscaling.maxReplicas) -}}
    {{- if gt .Values.autoscaling.minReplicas .Values.autoscaling.maxReplicas -}}
      {{- $errors = append $errors "autoscaling.minReplicas cannot be greater than autoscaling.maxReplicas" -}}
    {{- end -}}
  {{- end -}}
  {{- if not (kindIs "int" .Values.autoscaling.targetCPUUtilizationPercentage) -}}
    {{- $errors = append $errors "autoscaling.targetCPUUtilizationPercentage must be a number" -}}
  {{- else if or (lt .Values.autoscaling.targetCPUUtilizationPercentage 1) (gt .Values.autoscaling.targetCPUUtilizationPercentage 100) -}}
    {{- $errors = append $errors "autoscaling.targetCPUUtilizationPercentage must be between 1 and 100" -}}
  {{- end -}}
{{- end -}}

{{/* Validate ingress configuration */}}
{{- if .Values.ingress.enabled -}}
  {{- if not .Values.ingress.hosts -}}
    {{- $errors = append $errors "ingress.enabled is true but no hosts are configured" -}}
  {{- else -}}
    {{- range $index, $host := .Values.ingress.hosts -}}
      {{- if not $host.host -}}
        {{- $errors = append $errors (printf "ingress.hosts[%d].host is required" $index) -}}
      {{- end -}}
      {{- if not $host.paths -}}
        {{- $errors = append $errors (printf "ingress.hosts[%d].paths is required" $index) -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}

{{/* Output errors if any */}}
{{- if $errors -}}
{{- printf "\n" -}}
{{- printf "ERROR: PeaNUT Helm chart validation failed:\n" -}}
{{- range $errors -}}
{{- printf "  - %s\n" . -}}
{{- end -}}
{{- printf "\nPlease fix the above errors and try again.\n" -}}
{{- fail "PeaNUT Helm chart validation failed" -}}
{{- end -}}
{{- end -}}
