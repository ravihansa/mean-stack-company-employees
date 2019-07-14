const express = require('express');
const router = express.Router();

const ctrlEmployee = require('../controllers/employee.controller');
const ctrlCompany = require('../controllers/company.controller');
const ctrlUser = require('../controllers/user.controller');
const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);

router.post('/savecompany', jwtHelper.verifyJwtToken, ctrlCompany.saveCompany); 
router.post('/updatecompany', jwtHelper.verifyJwtToken, ctrlCompany.updateCompany); 
router.get('/loadcompany', jwtHelper.verifyJwtToken, ctrlCompany.loadCompanies); 
router.delete('/deletecompany/:id', jwtHelper.verifyJwtToken, ctrlCompany.deleteCompany);
router.get('/getcompany/:id', jwtHelper.verifyJwtToken, ctrlCompany.getCompany); 
router.post('/uploadcompanylogo', jwtHelper.verifyJwtToken, ctrlCompany.uploadCompanyLogo); 

router.post('/saveemployee', jwtHelper.verifyJwtToken, ctrlEmployee.saveEmployee);
router.post('/updateemployee', jwtHelper.verifyJwtToken, ctrlEmployee.updateEmployee); 
router.get('/loademployee/:id', jwtHelper.verifyJwtToken, ctrlEmployee.loadEmployees); 
router.delete('/deleteemployee/:id', jwtHelper.verifyJwtToken, ctrlEmployee.deleteEmployee);

module.exports = router;
