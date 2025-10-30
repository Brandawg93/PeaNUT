variable "VERSION" {
  default = "latest"
}

group "default" {
  targets = ["production"]
}

# Local development build - single platform, loads to Docker
target "local" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"]
  output = ["type=docker"]
  args = {
    NODE_VERSION = "lts-slim"
    BUILD_COMMAND = "build"
  }
  tags = [
    "brandawg93/peanut:local",
    "brandawg93/peanut:${VERSION}"
  ]
}

# Test deployment - arm64 and amd64 only
target "test" {
  dockerfile = "Dockerfile"
  platforms = ["linux/arm64", "linux/amd64"]
  args = {
    NODE_VERSION = "lts-slim"
    BUILD_COMMAND = "build"
  }
  tags = [
    "brandawg93/peanut:test"
  ]
}

# Production deployment - all platforms including arm/v7
target "production" {
  matrix = {
    platform = ["linux/arm/v7", "linux/arm64", "linux/amd64"]
  }
  name = "production-${replace(platform, "/", "-")}"
  dockerfile = "Dockerfile"
  platforms = [platform]
  args = {
    NODE_VERSION = platform == "linux/arm/v7" ? "22-slim" : "lts-slim"
    BUILD_COMMAND = platform == "linux/arm/v7" ? "next build --webpack" : "build"
  }
  tags = [
    "brandawg93/peanut:${VERSION}",
    "brandawg93/peanut:latest"
  ]
}

