<p align="center">
    <img alt="PeaNUT" src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/src/app/icon.svg" width="200px">
</p>

# PeaNUT

A Tiny Dashboard for Network UPS Tools

[![PayPal](https://img.shields.io/badge/paypal-donate-blue?logo=paypal)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CEYYGVB7ZZ764&item_name=peanut&currency_code=USD&source=url)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/brandawg93)](https://github.com/Brandawg93)
![Docker Pulls](https://img.shields.io/docker/pulls/brandawg93/peanut)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Brandawg93_PeaNUT&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Brandawg93_PeaNUT)

<img src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/images/table.png" width="600px" />
<img src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/images/charts.png" width="600px" />

## Features

- Monitor UPS devices connected to your network via [NUT](https://networkupstools.org)
- View real-time statistics and status of UPS devices
- Supports multiple UPS devices
- Execute commands on UPS devices
- Configure settings through a user-friendly UI
- Manual configuration via YAML file
- Access NUT server directly via terminal
- API access for integration with other tools
- [InfluxDB](https://www.influxdata.com) v2 integration for monitoring via [Grafana](https://grafana.com)
- [Prometheus](https://prometheus.io) support for monitoring and alerting
- Customizable widgets for [Homepage](https://gethomepage.dev) integration
- Detailed [documentation](https://github.com/Brandawg93/PeaNUT/wiki) and examples available

## Installation

Install using Docker

### docker run

```bash
docker run -v ${PWD}/config:/config -p 8080:8080 --restart unless-stopped \
--env WEB_PORT=8080 brandawg93/peanut
```

### docker-compose.yml

```yaml
services:
  peanut:
    image: brandawg93/peanut:latest
    container_name: PeaNUT
    restart: unless-stopped
    volumes:
      - /path/to/config:/config
    ports:
      - 8080:8080
    environment:
      - WEB_PORT=8080
```

### compile from source

```bash
git clone https://github.com/Brandawg93/PeaNUT.git
cd PeaNUT
npm i -g pnpm # only if you don't have pnpm installed
pnpm i
pnpm run build:local
pnpm run start:local
```

More examples can be found in the [examples](https://github.com/Brandawg93/PeaNUT/tree/main/examples) folder.

## Environment Variables

| Variable            | Default   | Description                                       |
| ------------------- | --------- | ------------------------------------------------- |
| WEB_HOST            | localhost | Hostname of web server                            |
| WEB_PORT            | 8080      | Port of web server                                |
| WEB_USERNAME        | undefined | Username of web app                               |
| WEB_PASSWORD        | undefined | Password of web app                               |
| BASE_PATH           | undefined | Base path for reverse proxy                       |
| DISABLE_CONFIG_FILE | undefined | If set to 'true', disables all config file saving |

## Configuration

Configuration is primarily done via the UI, but manual configuration can be done via the `/config/settings.yml` file within the container. More information can be found on the [wiki](https://github.com/Brandawg93/PeaNUT/wiki/YAML-Configuration).

## Authentication

Authentication can be enabled by setting both `WEB_USERNAME` and `WEB_PASSWORD` environment variables. When these are set:

- Web UI access will require login using these credentials
- API calls will require Basic Authentication

For API calls, you'll need to include an Authorization header with the Base64 encoded credentials in the format `username:password`. The header should be formatted as: `Authorization: Basic <encoded credentials>`

## API

| API Call                                                  | Description                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `GET /api/ping`                                           | Health check endpoint that returns "pong"                                 |
| `GET /api/v1/info`                                        | Retrieves information about the PeaNUT application                        |
| `GET /api/v1/version`                                     | Retrieves the version of the NUT server currently in use                  |
| `GET /api/v1/netversion`                                  | Retrieves the version of the network protocol currently in use            |
| `GET /api/v1/devices`                                     | Retrieves information about all UPS devices                               |
| `GET /api/v1/devices/[ups]`                               | Retrieves information about the specified UPS device                      |
| `GET /api/v1/devices/[ups]/vars`                          | Retrieves all variables for the specified UPS device                      |
| `GET /api/v1/devices/[ups]/var/[param]`                   | Retrieves value for a single parameter of the specified UPS device        |
| `POST /api/v1/devices/[ups]/var/[param]`                  | Saves value for a single parameter of the specified UPS device            |
| `GET /api/v1/devices/[ups]/var/[param]/description`       | Retrieves description for a single parameter of the specified UPS device  |
| `GET /api/v1/devices/[ups]/var/[param]/type`              | Retrieves type for a single parameter of the specified UPS device         |
| `GET /api/v1/devices/[ups]/var/[param]/enum`              | Retrieves enum values for a single parameter of the specified UPS device  |
| `GET /api/v1/devices/[ups]/var/[param]/range`             | Retrieves range values for a single parameter of the specified UPS device |
| `GET /api/v1/devices/[ups]/commands`                      | Retrieves available commands for the specified UPS device                 |
| `POST /api/v1/devices/[ups]/command/[command]`            | Executes a given command for the specified UPS device                     |
| `GET /api/v1/devices/[ups]/command/[command]/description` | Retrieves description for a single command of the specified UPS device    |
| `GET /api/v1/devices/[ups]/description`                   | Retrieves the description for the specified UPS device                    |
| `GET /api/v1/devices/[ups]/clients`                       | Retrieves the connected clients for the specified UPS device              |
| `GET /api/v1/devices/[ups]/rwvars`                        | Retrieves writable variables for the specified UPS device                 |
| `GET /api/v1/metrics`                                     | Metrics endpoint for prometheus                                           |
| `GET /api/ws`                                             | WebSocket endpoint for direct NUT server communication                    |

## Homepage Support

For information about how to set up Homepage, check the [Homepage docs](https://gethomepage.dev/widgets/services/peanut/).

Ex:

```yaml
widget:
  type: peanut
  url: http://peanut.host.or.ip:port
  key: nameofyourups
```

Or use the `customapi` widget for complete customization!

Ex:

```yaml
widget:
  type: customapi
  url: http://{HOSTNAME}:{PORT}/api/v1/devices/ups
  mappings:
    - field: battery.charge
      label: Battery Charge
      format: percent
    - field: battery.runtime
      label: Battery Runtime
      format: duration
    - field: ups.load
      label: UPS Load
      format: percent
    - field: ups.status
      label: UPS Status
      format: text
      remap:
        - value: OL
          to: Online
        - value: OB
          to: On Battery
        - value: LB
          to: Low Battery
        - any: true
          to: Unknown
```

## FAQ

**Question:** Chokidar is using lots of resources on my machine.

**Answer:** If you are using a Networked File Share, please see [#142](https://github.com/Brandawg93/PeaNUT/issues/142).

## Tested Devices

[A wiki](https://github.com/Brandawg93/PeaNUT/wiki/Tested-UPS-Devices) has been compiled of tested UPS devices. Feel free to look there for your device or add your device to the list by submitting an issue with the `tested device` label.

## Donate to Support PeaNUT

This project was made with you in mind. If you would like to show your appreciation for its continued development, please consider [sponsoring me on Github](https://github.com/sponsors/Brandawg93).

<details>
  <summary>Star History</summary>

[![Star History Chart](https://api.star-history.com/svg?repos=brandawg93/peanut&type=Date)](https://star-history.com/#brandawg93/peanut&Date)

</details>
