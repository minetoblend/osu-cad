import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { PreferencesService } from "./preferences.service";
import { AuthGuard } from "../auth/auth.guard";
import { Request } from "express";
import { Preferences } from "@osucad/common";
import { PreferencesModel } from "./preferences.document";

@Controller("api/preferences")
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  async getUserPreferences(@Req() request: Request): Promise<Preferences> {
    if (!request.session.user) {
      return new PreferencesModel().toObject({
        versionKey: false,
      });
    }
    const preferences = await this.preferencesService.getUserPreferences(
      request.session.user!.id,
    );

    return preferences.toObject({
      versionKey: false,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  async updateUserPreferences(
    @Req() request: Request,
    @Body() preferences: Preferences,
  ) {
    const result = await this.preferencesService.updateUserPreferences(
      request.session.user!.id,
      preferences,
    );

    return result.toObject({
      versionKey: false,
    });
  }
}
