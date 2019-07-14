const mongoose = require('mongoose');
const format = require('util').format;
const _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;

const Employee = mongoose.model('Employee');

module.exports.saveEmployee = (req, res) => {
    var employee = new Employee();
    employee.firstName = req.body.firstName;
    employee.lastName = req.body.lastName;
    employee.phoneNo = req.body.phoneNo;
    employee.email = req.body.email;
    employee.companyId = req.body.companyId;    
    employee.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
            if (err.code == 11000){
                res.status(422).send(['Email already registered']);
            } else {
                console.log('Error in Employee Save :' + JSON.stringify(err, undefined, 2));
            } 
        }
    });
}

module.exports.updateEmployee = (req, res) => {
    Employee.findOne({ _id: req.body._id },
        (err, employee) => {
            if (!employee)
                return res.status(404).json({ status: false, message: 'Employee record not found' });
            else{
                var employee = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNo: req.body.phoneNo,
                    email: req.body.email
                };
                Employee.findByIdAndUpdate(req.body._id, { $set: employee }, {new: true, useFindAndModify: false}, (err, doc) => {
                    if (!err) { res.send(doc); }
                    else { console.log('Error in Employee Update :' + JSON.stringify(err, undefined, 2)); }
                });
            }                
        }
    );  
}

module.exports.loadEmployees = (req, res) => {
    Employee.find({ companyId: req.params.id},
        (err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving Employees :' + JSON.stringify(err, undefined, 2)); }
    });
}

module.exports.deleteEmployee = (req, res) => {
    if (!ObjectId.isValid(req.params.id)){
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    } else {
        Employee.findByIdAndRemove(req.params.id, {useFindAndModify: false}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Employee Delete :' + JSON.stringify(err, undefined, 2)); }
        });
    }
}
