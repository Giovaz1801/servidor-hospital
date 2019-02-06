var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// // ========================================= //
// //  Obtener todos los Hospitales
// // ========================================= //

// Rutas
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });


            });
});

// // ========================================= //
// //  Crear un Hospital
// // ========================================= //

app.post('/', mdAutenticacion.verificaToken, (req, res) =>{

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) =>{

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Error al crear un Hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// // ========================================= //
// //  Actualizar  un Hospital
// // ========================================= //

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                erros: err
            });
        }

        if(!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital con el ID'+ id + ' no existe',
                erros: {message: 'No existe un Hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Error al actualizal el Hospital',
                    erros: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
        
    });

});

// // ========================================= //
// //  Borrar un Hospitale
// // ========================================= //

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el Hospital',
                erros: err
            });
        } 

        if (!hospitalBorrado) {
            return res.status(401).json({
                ok: false,
                mensaje: 'No existe un Hospital con ese ID'
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});




module.exports = app;