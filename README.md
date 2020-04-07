# fudge-docker-registry

## Snap Install

```bash
$ sudo snap install fdrsrv
# MODIFY /var/snap/fdrsrv/current/args/daemon-env
$ sudo systemctl enable snap.fdrsrv.daemon.service
$ sudo systemctl start snap.fdrsrv.daemon.service
```



## Environment

### \* `optional` **HOST**
**Server bind hostname**

* type : hostname



### \* `required` **PORT**
**Server bind port**

* type : number
* default : 33000



### \* `optional` **APP_DATA_DIR**
**Data directory path**

* type : path
* default : ./data
* snap default : $SNAP_COMMON/data (Typically /var/snap/fdrsrv/common/data)



### \* `optional` **APP_EXEC_DIR**
**app directory**

* type : path

Used to find sqlite3.node.



### \* `optional` **APP_CONTEXT_PATH**
**Server context path**

* type : path
* default : /
* example : /registry



### \* `required` **APP_ENDPOINT**
**Server Endpoint URL**

* type : url
* example : http://fdr.example.com:33000/registry



### \* `optional` **APP_SUB_DOMAIN**
**Sub domain suffix**

* type : domain
* example : sub.fdr.example.com

If you use a fudge docker registry by sub-domain, you must set this value.

For example, when APP_SUB_DOMAIN is sub.fdr.example.com
```bash
$ docker image pull quay.io.sub.fdr.example.com/image-org/image-name:1.2.3
```
When pulling the image as above, the image will be pulled from fdr.example.com/quay.io/image-org/image-name:1.2.3



### \* `optional` **APP_JWT_SECRET**
**JWT Secret Key**

* type : string

If not you set this value, set random value.

If you use clustering (HA), you must set to same value for all nodes.



### \* `optional` **APP_ALLOW_PUBLIC_PULL**
**Allow pull without login**

* type : true/yes/1 is Allow, otherwise is Deny
* default : true



### \* `optional` **APP_NEED_LOGIN**
**Need login for image push**

* type : false/no/0 is not need, otherwise is need
* default : true



### \* `optional` **APP_LOGIN_MODULE**
**Custom login module file path**

* type : path



### \* `optional` **APP_LOGIN_USERNAME** / **APP_LOGIN_PASSWORD**
**Login username / password**

* type : string

