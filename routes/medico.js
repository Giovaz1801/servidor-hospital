var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// // ========================================= //
// //  Obtener todos los Hospitales
// // ========================================= //

// Rutas
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar Medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
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

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) =>{

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Error al crear un Médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

// // ========================================= //
// //  Actualizar  un Hospital
// // ========================================= //

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el Médico',
                erros: err
            });
        }

        if(!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Médico con el ID'+ id + ' no existe',
                erros: {message: 'No existe un Médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Error al actualizal el Médico',
                    erros: err
                });
            }
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });
        
    });

});

// // ========================================= //
// //  Borrar un Hospitale
// // ========================================= //

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el Médico',
                erros: err
            });
        } 

        if (!medicoBorrado) {
            return res.status(401).json({
                ok: false,
                mensaje: 'No existe un Médico con ese ID'
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});




module.exports = app;