FROM node:16.13.0-bullseye


# Install wget, vim, and Google Chrome
ARG CHROME_VERSION=96.0.4664.45-1
ARG CHROME_URL="http://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_${CHROME_VERSION}_amd64.deb"
RUN apt-get update && apt-get install -y wget vim nano --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y purge google-chrome-stable \
    && wget -O /tmp/google-chrome-stable.deb $CHROME_URL \
    && dpkg -i /tmp/google-chrome-stable.deb \
    && rm -f /tmp/google-chrome-stable.deb

WORKDIR /app

COPY . /app

RUN npm install