const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const { Client } = require("ssh2");
const fs = require("fs");

const dbServer = {
  host: "database.cpu6428iy6nw.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
const tunnelConfig = {
  host: "54.167.56.153",
  port: 22,
  username: "ec2-user",
  privateKey: fs.readFileSync("database.pem"),
};
const forwardConfig = {
  srcHost: "127.0.0.1",
  srcPort: 3306,
  dstHost: dbServer.host,
  dstPort: dbServer.port,
};

const sshClient = new Client();
sshClient
  .on("ready", () => {
    sshClient.forwardOut(
      forwardConfig.srcHost,
      forwardConfig.srcPort,
      forwardConfig.dstHost,
      forwardConfig.dstPort,
      (err, stream) => {
        if (err) reject(err);
        const updatedDbServer = {
          ...dbServer,
          stream,
        };
        const connection = mysql.createConnection(updatedDbServer);
        connection.connect((error) => {
          if (error) {
            console.error("Error conectándose a la base de datos:", err.stack);
            return;
          }
          console.log(
            "Conectado a la base de datos como id " + connection.threadId,
          );
        });

        const app = express();
        // Configurar el puerto
        const PORT = process.env.PORT || 3000;

        // Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public'
        app.use(express.static(path.join(__dirname, "public")));

        // Ruta para la página principal
        app.get("/", (req, res) => {
          res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        // Iniciar el servidor
        app.listen(PORT, () => {
          console.log(`Servidor iniciado en http://localhost:${PORT}`);
        });

        app.get("/data", (req, res) => {
          connection.query("SELECT * FROM administrador", (err, results) => {
            if (err) {
              return res.status(500).send(err);
            }
            res.json(results);
          });
        });
      },
    );
  })
  .connect(tunnelConfig);
