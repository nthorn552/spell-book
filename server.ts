import express, { Request, Response } from "express";
import path from "path";
import { Entity } from "./schemas/entity";
const app = express();

//Import the mongoose module
import mongoose from 'mongoose';

//Set up default mongoose connection
const mongoDB = 'mongodb://localhost/spell_book_database';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Set up db
db.createCollection('Entities')
const firstEntity = new Entity({ name: 'First One' });

firstEntity.save((err, entity) => {
  console.log(entity);
});
Entity.find(function (err, entities) {
  if (err) return console.error(err);
  console.log(entities);
})

const PORT = process.env.PORT || 8082;
app.listen(PORT, function () {
  console.log("Production Express server running at localhost:" + PORT);
});
