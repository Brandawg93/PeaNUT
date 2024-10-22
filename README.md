<p align="center">
    <img alt="PeaNUT" src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/src/app/icon.svg" width="200px">
</p>

# PeaNUT

A Tiny Dashboard for Network UPS Tools

[![PayPal](https://img.shields.io/badge/paypal-donate-blue?logo=paypal)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CEYYGVB7ZZ764&item_name=peanut&currency_code=USD&source=url)
![Docker Pulls](https://img.shields.io/docker/pulls/brandawg93/peanut)
[![Crowdin](https://badges.crowdin.net/nut-dashboard/localized.svg)](https://crowdin.com/project/nut-dashboard)

<img src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/images/charts.png" width="600px" />

## Installation

Install using Docker

### docker run

```bash
docker run -v ${PWD}/config:/config -p 8080:8080 --restart unless-stopped \
--env NUT_HOST=nut-upsd --env NUT_PORT=3493 \
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
      - NUT_HOST=localhost
      - NUT_PORT=3493
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

_Note:_ Environment variables are not required and used for first time setup only.

| Variable        | Default   | Description                   |
| --------------- | --------- | ----------------------------- |
| NUT_HOST        | localhost | Host of NUT server            |
| NUT_PORT        | 3493      | Port of NUT server            |
| WEB_HOST        | localhost | Hostname of web server        |
| WEB_PORT        | 8080      | Port of web server            |
| USERNAME        | undefined | Optional but required to edit |
| PASSWORD        | undefined | Optional but required to edit |
| BASE_PATH       | undefined | Base path for reverse proxy   |
| INFLUX_HOST     | undefined | Host for Influx server        |
| INFLUX_TOKEN    | undefined | Token for Influx server       |
| INFLUX_ORG      | undefined | Org for influx server         |
| INFLUX_BUCKET   | undefined | Bucket for influx server      |
| INFLUX_INTERVAL | 10        | Inverval for Influx ingestion |

## API

| API Call                                            | Description                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/v1/devices`                               | Retrieves information about all UPS devices                              |
| `GET /api/v1/devices/[ups]`                         | Retrieves information about the specified UPS device                     |
| `GET /api/v1/devices/[ups]/var/[param]`             | Retrieves value for a single parameter of the specified UPS device       |
| `POST /api/v1/devices/[ups]/var/[param]`            | Saves value for a single parameter of the specified UPS device           |
| `GET /api/v1/devices/[ups]/var/[param]/description` | Retrieves description for a single parameter of the specified UPS device |
| `GET /api/v1/devices/[ups]/var/[param]/type`        | Retrieves type for a single parameter of the specified UPS device        |
| `GET /api/v1/devices/[ups]/commands`                | Retrieves available commands for the specified UPS device                |
| `GET /api/v1/devices/[ups]/description`             | Retrieves the description for the specified UPS device                   |
| `GET /api/v1/devices/[ups]/clients`                 | Retrieves the connected clients for the specified UPS device             |
| `GET /api/v1/devices/[ups]/rwvars`                  | Retrieves writable variables for the specified UPS device                |

## Homepage Support

For information about how to set up Homepage, check the [Homepage docs](https://gethomepage.dev/latest/widgets/services/peanut/).

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
      format: text
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

## Tested Devices

[A wiki](https://github.com/Brandawg93/PeaNUT/wiki/Tested-UPS-Devices) has been compiled of tested UPS devices. Feel free to look there for your device or add your device to the list by submitting an issue with the `tested device` label.

## Donate to Support PeaNUT

This project was made with you in mind. If you would like to show your appreciation for its continued development, please consider [sponsoring me on Github](https://github.com/sponsors/Brandawg93).
