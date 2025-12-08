import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  user_id: string;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const User = models.User || model<IUser>('User', userSchema, 'users');

export default User;