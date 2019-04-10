#Reload systemctl daemon to reload systemd manager configuration and recreate the entire dependency tree

sudo systemctl daemon-reload

#Enable uwsgi service to start on system reboot

sudo systemctl enable dat.uwsgi

#Start uwsgi service

sudo service dat.uwsgi start

#Restart uwsgi service

sudo service dat.uwsgi restart

#Check uwsgi service status

sudo service dat.uwsgi status

