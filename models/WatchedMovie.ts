import { Schema, model, models, Document } from 'mongoose';

export interface IWatchedMovie extends Document {
  user_id: string;
  id: number;
  watched_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const watchedMovieSchema = new Schema<IWatchedMovie>({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  id: {
    type: Number,
    required: true,
    index: true
  },
  watched_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

watchedMovieSchema.index({ user_id: 1, id: 1 }, { unique: true });

const WatchedMovie = models.WatchedMovie || model<IWatchedMovie>('WatchedMovie', watchedMovieSchema, 'watched_movies');

export default WatchedMovie;