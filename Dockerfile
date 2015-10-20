FROM node:4.2.1-onbuild

EXPOSE 80

ADD . /

CMD node server.js
