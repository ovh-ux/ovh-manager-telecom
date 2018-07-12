# OVH Manager Telecom

![ovh-manager-telecom-banner](https://user-images.githubusercontent.com/428384/28011818-f3bc7352-6563-11e7-92c6-3eea142dcd6b.png)

> OVH Control Panel Telecom UI

## Install

### Requirements

* You must have a sane installation of ``nodejs`` (with ``npm``)
* You must have a sane installation of ``yarn`` (``npm install -g yarn``)
* You must have a sane installation of ``grunt`` (``npm install -g grunt-cli``)

### Install dependencies

```bash
make install
```

## Run in development mode

First you have to activate the developer mode in the [Manager V6](https://www.ovh.com/manager/dedicated/#/useraccount/advanced).

### Generate your certificates

To be able to run manager in dev mode using http2.

```bash
make gen-certificate
```

If you want, you can also generate a certificate by hand:

```bash
mkdir -p server/certificate
openssl genrsa -des3 -out server/certificate/server.key 1024
openssl req -new -key server/certificate/server.key -out server/certificate/server.csr
cp server/certificate/server.key server/certificate/server.key.tmp
openssl rsa -in server/certificate/server.key.tmp -out server/certificate/server.key
openssl x509 -req -days 365 -in server/certificate/server.csr -signkey server/certificate/server.key -out server/certificate/server.crt
rm server/certificate/server.key.tmp
```

A full guide can be found for example [here](https://www.akadia.com/services/ssh_test_certificate.html).

### Launch the manager

```bash
make dev
```

The manager is running on [https://localhost:8181](https://localhost:8181)

And start developing.

## Documentation

There is a begining of documentation available. To build docs, run :

```bash
grunt docs
```

To see the generated documentation, you need `npm serve` installed globally (`npm install -g serve`). Once installed, run :

```bash
serve docs
```

## Related links

 * Contribute: https://github.com/ovh-ux/ovh-ux-guidelines/blob/master/.github/CONTRIBUTING.md
 * Report bugs: https://github.com/ovh-ux/ovh-manager-telecom/issues

## License

See https://github.com/ovh-ux/ovh-manager-telecom/blob/master/LICENSE
