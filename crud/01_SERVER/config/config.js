const config = {
  server: 'ADWEDELF\\MSSQLADWED',
  database: 'CRUD',
  port:1433,
  user: 'sa',
  password: '111111111111111',
  trustServerCertificate:true,
    options: {
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1',
        trustServerCertificate: true,
      }
    }
};
module.exports = (config);