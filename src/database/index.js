import mongoose from 'mongoose';
import Sequelize from 'sequelize';

import Appointment from '../app/models/Appointment';
import File from '../app/models/File';
import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [Appointment, File, User];

class Database {
  constructor() {
    this.connection = new Sequelize(databaseConfig);
    this.init();
    this.mongo();
  }

  init() {
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

export default new Database();
