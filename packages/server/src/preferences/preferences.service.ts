import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Preferences} from "@osucad/common";
import {UserPreferences} from "./preferences.document";


@Injectable()
export class PreferencesService {

  constructor(
      @InjectModel('preferences')
      private readonly model: Model<UserPreferences>,
  ) {
  }


  async getUserPreferences(userId: number) {
    const result = await this.model.findOne({
      userId: userId,
    }).exec()

    if (result === null) {
      return new this.model({
        userId: userId,
      }).save()
    }

    return result;
  }

  async updateUserPreferences(userId: number, preferences: Preferences) {
    return this.model.findOneAndUpdate(
        {
          userId,
        },
        {
          ...preferences,
          userId,
        },
        {
          new: true,
          upsert: true,
        }
    ).exec()
  }
}
