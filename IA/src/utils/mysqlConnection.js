import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

// Configurações de conexão com o banco de dados

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Restante do seu código usando a conexão com o banco de dados

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    throw err;
  }
  console.log("Conexão com o banco de dados MySQL estabelecida!");
});

export default connection;
