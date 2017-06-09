# web deploy

```bash
# Install
$ npm install web-deploy -g
```

### create `.deploy` file
``` json
{
    "delpoyPath": "app",
    "key": "web-deploy",
    "url": "http://localhost",
    "port": 9000
}
```
* server side execute command `deploy-server`

* client side execute command `deploy-client`