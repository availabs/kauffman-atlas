var secrets = require('./secrets.js');

var config = {

  s3: {
    // Let's stick with single S3 bucket for now
    staging: {
      credentials:  {
        accessKeyId:     secrets.s3.accessKeyId,
        secretAccessKey: secrets.s3.secretAccessKey,
        params: {
          Bucket: 'eea.availabs.org'
        }
      },
      dirname: '/',
      assetsPath: 'dist/**',
    },
    development: {
      credentials:  {
        accessKeyId:     secrets.s3.accessKeyId,
        secretAccessKey: secrets.s3.secretAccessKey,
        params: {
          Bucket: 'eea.availabs.org'
        }
      },
      dirname: '/',
      assetsPath: 'dist/**',
    },
    production: {
      credentials:  {
        accessKeyId: secrets.s3.accessKeyId,
        secretAccessKey: secrets.s3.secretAccessKey,
        params: {
          Bucket: 'eea.availabs.org'
        }
      },
      dirname: '/',
      assetsPath: 'dist/**',
    }
  }
}

module.exports = config;