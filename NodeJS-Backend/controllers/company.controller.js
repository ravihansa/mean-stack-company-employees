const mongoose = require('mongoose');
const format = require('util').format;
const _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;

const Company = mongoose.model('Company');

// require multer for the file uploads
const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: 'companymgtsystem',
    keyFilename: './config/serviceAccountKey.json'
});
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);  
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 3 * 1024 * 1024
    }
});

module.exports.saveCompany = (req, res) => {
    var company = new Company();
    company.name = req.body.name;
    company.email = req.body.email; 
    company.logoPath = req.body.logoPath;
    company.webSite = req.body.webSite; 
    company.save((err, doc) => {
        if (!err) {
            res.send(doc);
        }
        else {
            if (err.code == 11000){
                res.status(422).send(['Email already registered']);
            } else {
                console.log('Error in Company Save :' + JSON.stringify(err, undefined, 2));
            }            
        }
    });
}
                        
module.exports.updateCompany = (req, res) => {
    Company.findOne({ _id: req.body._id },
        (err, company) => {
            if (!company)
                return res.status(404).json({ status: false, message: 'Company record not found' });
            else{
                var company = {
                    name: req.body.name,
                    email: req.body.email,
                    webSite: req.body.webSite,
                };
                Company.findByIdAndUpdate(req.body._id, { $set: company }, {new: true, useFindAndModify: false}, (err, doc) => {
                    if (!err) { res.send(doc); }
                    else { console.log('Error in Company Update :' + JSON.stringify(err, undefined, 2)); }
                });
            }                
        }
    );  
}

module.exports.loadCompanies = (req, res) => {
    Company.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving Companies :' + JSON.stringify(err, undefined, 2)); }
    });
}

module.exports.deleteCompany = (req, res) => {
    if (!ObjectId.isValid(req.params.id)){
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    } else {
        Company.findByIdAndRemove(req.params.id, {useFindAndModify: false}, (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Company Delete :' + JSON.stringify(err, undefined, 2)); }
        });
    }
}

module.exports.getCompany = (req, res) => {
    Company.findOne({ _id: req.params.id },
        (err, company) => {
            if (!company)
                return res.status(404).json({ status: false, message: 'Company record not found' });
            else{
                var imgPath = company.logoPath;
                if(imgPath){
                    createImageUrl(imgPath).then((url) => {
                        if(url){
                            const imgUrl = url;                                  
                            res.status(200).json({ status: true, company : _.pick(company,['name']), imgUrl: imgUrl });
                        } else {                
                            return res.status(422).json({ status: false, message: 'Something is wrong! Unable to load the data' });
                        }
                      }).catch((error) => {
                        console.error(error);
                      });
                } else {
                    res.status(200).json({ status: true, company : _.pick(company,['name'])});
                }                
            }                
        }
    );  
}

module.exports.uploadCompanyLogo = (req, res, next) => {
    const upload = multer.single('logo');
    upload(req, res, function (err) {      
        let file = req.file;
        if (file) {
          uploadImageToStorage(file).then((path) => {
            if(path){
                Company.findOne({ _id: req.body.companyId },
                    (err, company) => {
                        if (!company)
                            return res.status(404).json({ status: false, message: 'Company record not found' });
                        else{                    
                            Company.findByIdAndUpdate(req.body.companyId, { $set: {logoPath: path} }, {new: true, useFindAndModify: false}, (err, doc) => {
                                if (!err) {  
                                    return res.status(200).json({ status: true, message: 'Uploaded Successfully'});
                                } else { 
                                    console.log('Error in Update Path :' + JSON.stringify(err, undefined, 2)); 
                                    return res.status(422).send("Error in Update Image Path");
                                }
                            });
                        }                
                    }
                ); 
            }else {                
                return res.status(422).json({ status: false, message: 'Something is wrong! Unable to upload at the moment' });
            }
          }).catch((error) => {
            console.error(error);
          });
        }        
    });  
}
/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No image file');
      }
      const newFileName = `${file.originalname}_${Date.now()}`;  
      const fileUpload = bucket.file('company-logo' + '/' + newFileName);
 
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });  
      blobStream.on('error', (error) => {
       const path = null;
       resolve(path);
      });  
      blobStream.on('finish', () => {
        const path = format(`${fileUpload.name}`);
        resolve(path);
      });  
      blobStream.end(file.buffer);
    });
}

// Get a signed URL to allow limited time access to the picture
const createImageUrl = (path) => {
    return new Promise((resolve, reject) => {
      if (!path) {
        reject('No image path');
        } 
        var file = bucket.file(path);       
        const options = {
            action: 'read',
            expires: '03-02-2025',
          };
        file.getSignedUrl(options)
          .then(results => {
            const url = results[0];
            resolve(url);
          })
          .catch(err => {
              console.error('ERROR:', err);
              const url = null;
              resolve(url);
          });
    });
}
