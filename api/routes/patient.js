var express = require('express');
var router = express.Router();
const Patients = require('../schemas/PatientSchema.js');
const PaginationMetadata = require('../services/PaginationMetadata');
var mongoose = require('mongoose');

/*
 * GET all patients 
 */
router.get('/', async (req, res, next) => {
    //Pagination Metadata
    if (!req.query.pageNumber) {
        req.query.pageNumber = 1;
    }
    if (!req.query.pageSize) {
        req.query.pageSize = 10;
    }

    try {
        const patients = await Patients.find().exec();

        const paginationMetaData = new PaginationMetadata(patients.length,
            parseInt(req.query.pageSize),
            parseInt(req.query.pageNumber));

        const returnData = await Patients.find()
            .limit(parseInt(req.query.pageSize))
            .skip((parseInt(req.query.pageNumber - 1) * req.query.pageSize))
            .sort({firstName: 1})
            .exec();

        res.set({
            "X-Pagination": JSON.stringify(paginationMetaData)
        });

        res.send(returnData);
    }

    catch (err) {
        console.log(err.message);
    }

});

/*
 * GET specific patient by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const patient = await Patients.find({ _id: req.params.id });
        if (patient.length == 0) {
            res.statusMessage = "No Patient found with id " + req.params.id;
            res.status(404).end();
            return;
        }
        res.send(patient[0]);
    }
    catch (err) {
        console.error(err);
        res.statusMessage = "No Patient found with id " + req.params.id;
        res.status(404).end();
    }
});

/*
 * POST a new exam
 */
router.post('/', async (req, res, next) => {
    try {
        var body = req.body;

        Patients.create({
            firstName: body['firstName'],
            lastName: body['lastName'],
            age: body['age'],
            sex: body['sex'],
            zipCode: body['zipCode']
        });

        res.statusMessage = "Successfully created!";
        res.status(201).end();
    }
    catch (err) {
        console.log(err.name);
        if (err.name === "ValidatorError") {
            let errors = []

            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            res.status(400).send(errors).end();
        }
        res.status(500).send("Something went wrong!").end();        
    }
});

/*
 * REPLACE an exam by ID
 */
router.put('/:id', async (req, res, next) => {
    res.send("Received put request with ID: " + req.params.id);
});

/*
 * UPDATE an exam by ID
 */
router.patch('/:id', async (req, res, next) => {
    res.send("Received patch request with ID: " + req.params.id);
});

/*
 * DELETE an exam by ID
 */
router.delete('/:id', async (req, res, next) => {
    res.send("Received delete request with ID: " + req.params.id);
});

module.exports = router;
