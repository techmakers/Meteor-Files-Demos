import {FilesCollection} from 'meteor/ostrio:files';

export const remoteUploader = function(url,collectionname,appid){
    var self = this ;
    self.url = url ;
    self.collectionName = collectionname ;
    self.appid = appid ;
    self.ddp = DDP.connect(url) ;
    self.collection = new FilesCollection({
        debug: true,
        ddp: self.ddp,
        collectionName: collectionname,
        onBeforeUpload: function (file) {
            // Allow upload files under 10MB, and only in png/jpg/jpeg formats
            file.meta.appid = appid ;
            console.log(file);
            if (file.size <= 1024 * 1024 * 10 && /pdf|png|jpe?g/i.test(file.extension)) {
                return true;
            }
            return 'Please upload image, with size equal or less than 10MB';
        }
    });
};

remoteUploader.prototype.subscribe = function(cb){
    var self = this ;
    self.ddp.subscribe('files.images.all',{appid:self.appid},function(){
        cb(this) ;
    });
};

remoteUploader.prototype.uploadWithDataUrl = function(dataurl,filename,cb){
    var self = this ;
    var ret = self.collection.insert({
        file: dataurl,
        isBase64: true,
        fileName: filename
    }).on('end', function(error, fileObj) {
        if (error) {
            cb(error) ;
        } else {
            var url = self.url + fileObj._downloadRoute + "/" + self.collectionName + "/" + fileObj._id + "/original/" + fileObj._id + fileObj.extensionWithDot ;
            // http://localhost:3000/cdn/storage/Images/TgNz52NBwYR99qbaa/original/TgNz52NBwYR99qbaa.pdf?download=true
            fileObj.url = url ;
            cb(null,fileObj) ;
        }
    });
};