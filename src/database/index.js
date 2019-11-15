import mongoose from 'mongoose';
import Sequelize from 'sequelize';

import Appointment from '../app/models/Appointment';
import File from '../app/models/File';
import User from '../app/models/User';
import databaseConfig from '../config/database';
import mongoConfig from '../config/mongo';

const models = [Appointment, File, User];

class Database {
  constructor() {
    this.connection = new Sequelize(databaseConfig);

    this.init();
    this.associate();
    this.mongo();
  }

  init() {
    models.forEach(model => model.init(this.connection));
  }

  associate() {
    models.forEach(model => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }

  mongo() {
    const { host, port, database, user, pass } = mongoConfig;
    const mongoURI = `mongodb://${user}:${encodeURIComponent(
      pass
    )}@${host}:${port}/${database}`;

    this.mongoConnection = mongoose.connect(mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

export default new Database();
