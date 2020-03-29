const CONFIG = {
  secret: 'worldisfullofdevelopers',
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456a@',
    database: 'sxmb',
    insecureAuth: true
  },
  mongo: 'mongodb://127.0.0.1:27017/sxmb',
  loki: {
    DB_NAME: 'db.json',
    COLLECTION_NAME: 'images',
    UPLOAD_PATH: 'src/uploads'
  }
}

export default CONFIG
