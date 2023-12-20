<p align="center">
    <img alt="PeaNUT" src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/blob/main/src/app/icon.svg" width="200px">
</p>

# PeaNUT

A Tiny Dashboard for Network UPS Tools

[![PayPal](https://img.shields.io/badge/paypal-donate-blue?logo=paypal)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CEYYGVB7ZZ764&item_name=peanut&currency_code=USD&source=url)
![Docker Pulls](https://img.shields.io/docker/pulls/brandawg93/peanut)

<img src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/images/charts.png" width="600px" />

## Installation

Install using Docker

### docker run
```
docker run -p 8080:8080 --restart unless-stopped \
--env NUT_HOST=nut-upsd --env NUT_PORT=3493 \
--env WEB_PORT=8080 brandawg93/peanut
```
### docker-compose.yml
```
version: '3'
services:
  nut_dashboard:
    image: brandawg93/peanut:latest
    container_name: PeaNUT
    restart: unless-stopped
    ports:
      - 8080:8080
    environment:
      - NUT_HOST=localhost
      - NUT_PORT=3493
      - WEB_PORT=8080
```

More examples can be found in the [examples](https://github.com/Brandawg93/PeaNUT/tree/main/examples) folder.

## Environment Variables

Variable | Default | Description |
-------- | ------- | ----------- |
NUT_HOST | localhost | Host of NUT server |
NUT_PORT | 3493 | Port of NUT server |
WEB_PORT | 8080 | Port of web server |

## API

| API Call | Description |
|----------|-------------|
| `GET /api/v1/devices` | Retrieves information about all UPS devices |
| `GET /api/v1/devices/[ups]` | Retrieves information about the specified UPS device |
| `GET /api/v1/devices/[ups]/[param]` | Retrieves information about a single parameter of the specified UPS device |

## Homepage Support

With v1.3.0, initial support has been added for [Homepage](https://github.com/benphelps/homepage) to add a custom api widget. An example can been seen below:
```
widget:
    type: customapi
    url: http://{hostname}:{port}/api/v1/devices/ups
    mappings:
    - field: battery_charge
      label: Battery Charge
      format: percent
    - field: ups_load
      label: UPS Load
      format: percent
    - field: ups_status
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