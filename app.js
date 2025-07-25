const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/nosqltest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error al conectar a Mongo:", err));

// Modelo de usuario
const User = mongoose.model('User', new mongoose.Schema({
  user: String,
  pass: String
}));

// Servir HTML estático
app.use(express.static(path.join(__dirname, 'views')));

// Ruta vulnerable al NoSQL Injection
app.post('/login', async (req, res) => {
  let { user, pass } = req.body;

  try {
    user = JSON.parse(user);
  } catch (e) {
    // No es JSON, queda como string
  }

  try {
    pass = JSON.parse(pass);
  } catch (e) {
    // No es JSON, queda como string
  }

  console.log("Parsed user:", user);
  console.log("Parsed pass:", pass);

  try {
    const found = await User.findOne({ user: user, pass: pass });
    if (found) {
      res.send("✅ ¡Login exitoso! Usuario válido.");
    } else {
      res.send("❌ Usuario o contraseña incorrectos.");
    }
  } catch (err) {
    console.error("Error en consulta:", err);
    res.status(500).send("Error en el servidor");
  }
});


// Crear usuario de prueba
app.get('/seed', async (req, res) => {
  await User.create({ user: "admin", pass: "admin123" });
  res.send("Usuario creado: admin / admin123");
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});
