var through = require('through2');
var gutil = require('gulp-util');
var extend = require('object-assign');
var licenseUpdater = require('./src/main');

module.exports = function (config, license, rate) {
    rate = rate || 0.8;
    var filePaths = [];
    return through.obj(function (file, encoding, callback) {
        var filename = licenseUpdater.getFileName(file);
        var template = gutil.template(license, extend({
            file: file, filename: filename
        }, config));
        config = config || {};
        if (config.check) {
            if (licenseUpdater.check(file.contents.toString('utf-8').split(/\r?\n/), template.split(/\r?\n/)) >= rate) {
                var path = file.path.replace(process.cwd(), '');
                path = path.replace(new RegExp('^[/\\\\]'), '');
                filePaths.push(path.replace(/\\/g, '/'));
            }
        } else if (config.format) {
            var templateArr = template.split(/\r?\n/);
                var source = file.contents.toString('utf-8').split(/\r?\n/);
            if (licenseUpdater.check(source, templateArr) >= rate) {
                if (source[templateArr.length - 1].replace(/\s/, '') === '') {
                    source.splice(0, templateArr.length);
                } else {
                    source.splice(0, templateArr.length - 1);
                }
                file.contents = new Buffer(source.join('\r\n'));
            }
        } else if (config.remove) {

        }
        callback(null, file, filePaths);
    });
};