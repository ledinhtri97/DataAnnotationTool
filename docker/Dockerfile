FROM python:3.7

ENV WORKSPACE "/workspace"
ARG NODE_BUILD_TYPE
ARG DJANGO_SETTINGS

RUN mkdir -p $WORKSPACE
WORKDIR $WORKSPACE

COPY ./requirements.txt $WORKSPACE
COPY ./package.json $WORKSPACE

RUN pip install -r $WORKSPACE/requirements.txt

# ---------------------------
# | Install Node 10.x & NPM |
# ---------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
         build-essential \
         git \
         curl \               
         nano \
         htop \
         wget \
         unzip \
         ssh \
         nginx \
         apt-transport-https \
         ca-certificates \
         software-properties-common
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y --no-install-recommends nodejs
# ---------------------------

# ----------------------
# | Install JupyterLab |
# ----------------------
RUN pip install --upgrade pip
RUN pip install setuptools jupyterlab numpy
# ----------------------

ADD . $WORKSPACE
RUN mkdir -p $WORKSPACE/DAT/_DATABASE_
RUN npm install
RUN npm run ${NODE_BUILD_TYPE}

RUN cp $WORKSPACE/docker/settings/dev.py $WORKSPACE/DAT/DAT/settings/dev.py
RUN cp $WORKSPACE/docker/settings/prod.py $WORKSPACE/DAT/DAT/settings/prod.py

ENV DJANGO_COMMAND "cd DAT && python manage.py runserver --setting=${DJANGO_SETTINGS} 8787"
CMD $DJANGO_COMMAND
