# Create User and Database in Postgresql (DEV)

```
sudo -u postgres psql
postgres=# CREATE USER docker_gvlab_dev WITH SUPERUSER;
postgres=# ALTER USER docker_gvlab_dev WITH ENCRYPTED PASSWORD 'gvlab@2019';
postgres=# CREATE DATABASE docker_dat_gvlab_dev WITH OWNER = 'docker_gvlab_dev';
```

# Development Setup

```
docker-compose build
docker-compose up -d
```

Go to localhost:8989 on browser!