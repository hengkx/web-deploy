# web deploy

```bash
# Install
$ npm install web-deploy -g
```

### create `.deploy` file
``` json
{
    "delpoyPath": "app",
    "token": "web-deploy",
    "url": "http://localhost",
    "port": 9000
}
```
* server side execute command `deploy-server`

* client side execute command `deploy-client`

### Specify the configuration file, default `.deploy`
``` bash
$ deploy-client --config .deploy
```
