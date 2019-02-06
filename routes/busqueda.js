var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//  ========================================
//  Busqueda por colección
//  ========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) =>{
   
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var expresionReg = new RegExp(busqueda, 'i'); 

    var promesa;

    switch(tabla){

        case 'usuarios':
        promesa = buscarUsuarios(busqueda, expresionReg);
        break;

        case 'medicos':
        promesa = buscarMedicos(busqueda, expresionReg);
        break;

        case 'hospitales':
        promesa = buscarHospitales(busqueda, expresionReg);
        break;

        default: 
        return res.status(400).json({
            ok: false,
            mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales'
        });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
    
});


//  ========================================
//  Busqueda General
//  ========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var expresionReg = new RegExp(busqueda, 'i'); 

    Promise.all( 
            [buscarHospitales( busqueda, expresionReg ), 
            buscarMedicos( busqueda, expresionReg ),
            buscarUsuarios( busqueda, expresionReg ) ] )
        .then( respuestas => {
            
                        res.status(200).json({
                            ok: true,
                            hospitales: respuestas[0],
                            medicos: respuestas[1],
                            usuarios: respuestas[2]
                        });
        })

});

function buscarHospitales( busqueda, expresionReg ) {

    return new Promise( (resolve, reject) => {

        Hospital.find({ nombre: expresionReg})
                    .populate('usuario', 'nombre email')
                    .exec((err, hospitales) => {
    
            if (err) {
                reject('Error al buscar Hospitales');
            }else{
                resolve(hospitales);
            }
        });
        
    }); 

}


function buscarMedicos( busqueda, expresionReg ) {

    return new Promise( (resolve, reject) => {

        Medico.find({ nombre: expresionReg })
                    .populate('usuario', 'nombre email')
                    .populate('hospital')
                    .exec((err, medicos) => {
    
            if (err) {
                reject('Error al buscar Medicos');
            }else{
                resolve(medicos);
            }
        });
    }); 
}

function buscarUsuarios( busqueda, expresionReg ) {

    return new Promise( (resolve, reject) => {

        Usuario.find({}, 'nombre email role')
                        .or( [ {'nombre':expresionReg}, {'email': expresionReg} ] )
                        .exec( (err, usuarios) => {

                            if(err) {
                                reject('Error al buscar los Usuarios');
                            } else {
                                resolve(usuarios);
                            }

                        })
        
    }); 
}

module.exports = app;