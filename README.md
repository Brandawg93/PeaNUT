<p align="center">
    <img alt="Homebridge Verified" src="https://raw.githubusercontent.com/Brandawg93/PeaNUT/main/client/src/logo.svg" width="200px">
</p>

# PeaNUT

A Tiny Dashboard for Network UPS Tools

[![PayPal](https://img.shields.io/badge/paypal-donate-blue?logo=paypal)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CEYYGVB7ZZ764&item_name=peanut&currency_code=USD&source=url)
![Docker Pulls](https://img.shields.io/docker/pulls/brandawg93/peanut)

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

## Tested Devices

[A wiki](https://github.com/Brandawg93/PeaNUT/wiki/Tested-UPS-Devices) has been compiled of tested UPS devices. Feel free to look there for your device or add your device to the list by submitting an issue with the `tested device` label.

## Donate to Support PeaNUT
This project was made with you in mind. If you would like to show your appreciation for its continued development, please consider [sponsoring me on Github](https://github.com/sponsors/Brandawg93).