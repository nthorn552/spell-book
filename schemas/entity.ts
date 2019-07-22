import { Document, Schema, Model, model } from "mongoose";
import IEntity from "../interfaces/entity";

export interface IEntityModel extends IEntity, Document {
    name: string;
}

export const EntitySchema: Schema = new Schema({
    name: String
});

export const Entity: Model<IEntityModel> = model<IEntityModel>("Entity", EntitySchema);
