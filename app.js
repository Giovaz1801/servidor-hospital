// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicialización de variables
var app = express();

// Conexión a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log(' \x1b[36m%s\x1b[0m', 'Base de datos en el puerto 27017');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada exitosamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log(' \x1b[36m%s\x1b[0m', 'Servidor express corriendo en el puerto 3000');
});