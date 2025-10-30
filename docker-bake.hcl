variable "VERSION" {
  default = "latest"
}

group "default" {
  targets = ["unified"]
}

target "unified" {
  name = "platform-${replace(platform, "/", "-")}"
  dockerfile = "Dockerfile"
  platforms = ["linux/arm/v7", "linux/arm64", "linux/amd64"]
  args = {
    NODE_VERSION = platform == "linux/arm/v7" ? "22-slim" : "lts-slim"
    BUILD_COMMAND = platform == "linux/arm/v7" ? "next build --webpack" : "build"
  }
  tags = [
    "brandawg93/peanut:${VERSION}",
    "brandawg93/peanut:latest",
    "brandawg93/peanut:test"
  ]
}

