# Notification Service

## Run
```
docker compose up
```

## Environments

> // TODO

## Doc

### Served

```
http://<API_url>/doc
```

### File


```
./swagger.json
```

### Build documentation

```
docker compose -f docker-compose.swagger.yaml up --build && docker compose -f docker-compose.swagger.yaml down --rmi=local
```