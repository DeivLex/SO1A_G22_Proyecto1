# Obtener la imagen que necesitamos
FROM golang

# Asignar el workdir de la api
WORKDIR /app

# Copiar todos los archivos al workdir
COPY . .

#ENV HOST=0.0.0.0:3000

# Correr 'npm install' para instalar todas las dependencias que necesitemos
RUN go mod download
# Aca pueden existir muchos mas comandos "run"

# Exponer el puerto 4001 al mundo
EXPOSE 3000

# Correr NodeJS
CMD ["go", "run", "server.go"]