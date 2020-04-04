curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - &&
sudo update && sudo apt install nodejs &&
sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential
npm install && npm run prod &&
python3 -m pip install --user virtualenv &&
python3 -m virtualenv env &&
source env/bin/activate &&
pip install -r requirements.txt &&
sudo apt-get install wget ca-certificates &&
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - &&
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list' &&
sudo apt-get update &&
sudo apt-get install postgresql postgresql-contrib &&
sudo su - postgres && psql &&
CREATE ROLE gvlab WITH LOGIN CREATEDB ENCRYPTED PASSWORD 'gvlab@2019';
su - gvlab && createdb dat_gvlab
#maybe import database (pg_restore -d dat_gvlab backupDATwithP4-05032020.tar -c -U gvlab -h localhost -n public)
echo "deb https://dl.bintray.com/rabbitmq/debian bionic main" | sudo tee 
sudo apt-get install rabbitmq-server
nano ../env/lib/python3.6/site-packages/progressbarupload/templatetags/progress_bar.py
#from django.urls import reverse
sudo apt-get install nginx && sudo apt-get install uwsgi-plugin-python3 && sudo apt-get install uwsgi
sudo cp -rv DataAnnotationTool/serverconfig/prod_dat_nginx.conf /etc/nginx/sites-available/
sudo cp prod.dat.uwsgi.service /etc/systemd/system/
sudo cp celery_dat.service /etc/systemd/system/
sudo cp celery /etc/conf.d/
sudo systemctl daemon-reload
systemctl start prod.dat.uwsgi.service
systemctl start celery_dat.service
