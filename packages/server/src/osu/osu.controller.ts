import {Controller, Get} from "@nestjs/common";

@Controller("api/osu")
export class OsuController {

  @Get("users/search")
  async searchUsers() {
  }

}