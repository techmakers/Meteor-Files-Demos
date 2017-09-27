import {Meteor}          from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';
import {apps}            from '../lib/apps.collection.js' ;

const Images = new FilesCollection({
    debug: true,
    collectionName: 'Images',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (Meteor.isServer){
            console.info("file", file);
            if (file.meta && file.meta.appid) {
                var authorized = apps.checkIfRegistered(file.meta.appid);
                if (!authorized) return "Please pass a valid 'appid' in 'meta.appid'";
            }
        }
        if (file.size <= 1024 * 1024 * 10 && /png|jpe?g/i.test(file.extension)) {
            return true;
        }
        return 'Please upload image, with size equal or less than 10MB';
    }
});

if (Meteor.isServer) {
    Images.denyClient();
    Meteor.publish('files.images.all', function (params) {
        if (!(params && params.appid)) return;
        return Images.find({'meta.appid': params.appid}).cursor;
    });
}

export default Images;
