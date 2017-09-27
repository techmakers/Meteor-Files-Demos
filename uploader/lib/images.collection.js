import {Meteor}          from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';
import {apps}            from '../lib/apps.collection.js' ;

const Images = new FilesCollection({
    debug: true,
    collectionName: 'Images',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        if (Meteor.isServer){
            console.info("file", file);
            var authorized = false ;
            if (file.meta && file.meta.appid) authorized = apps.checkIfRegistered(file.meta.appid);
            if (!authorized) return "Please pass a valid 'appid' in 'meta.appid'";
        }
        if (file.size <= 1024 * 1024 * 10 && /pdf|png|jpe?g/i.test(file.extension)) {
            return true;
        }
        return 'Please upload image, with size equal or less than 10MB';
    }
});

if (Meteor.isServer) {
    Images.denyClient();
    Meteor.publish('files.images.all', function (params) {
        if (!(params && params.appid)) return;
        var ret  = Images.find({'meta.appid': params.appid});
        return ret.cursor ;
    });
}

export default Images;
