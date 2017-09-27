export const apps = new Mongo.Collection('apps') ;

apps.checkIfRegistered = function(appid){
    if (apps.findOne({appid:appid})) return true ;
    return false ;
}

Meteor.startup(function(){
    if (apps.find().count() === 0) apps.insert({appid:'modem323'}) ;
})