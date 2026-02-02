# Angular Frontend
FROM node:20

WORKDIR /app

# Angular CLI global installieren
RUN npm install -g @angular/cli

# Abhängigkeiten installieren
COPY package*.json /app/
RUN npm install

# Code kopieren
COPY . /app

EXPOSE 4200

# Angular App starten
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
