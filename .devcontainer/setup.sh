#!/usr/bin/env bash

# Install Node packages
pnpm config set store-dir ~/pnpm
pnpm install

echo "Adding skeleton config"
sudo cp -r config/* /etc/nut

echo 0 > upsd.pid
echo 0 > upsmon.pid

sudo mv upsd.pid /run/nut
sudo mv upsmon.pid /run/nut

sudo /usr/sbin/upsdrvctl -u root start
sudo /usr/sbin/upsd -u nut
sudo /usr/sbin/upsmon -DB