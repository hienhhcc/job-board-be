import { All, Controller, Req, Res } from '@nestjs/common';
import { InngestService } from 'src/inngest/inngest.service';

@Controller('/api/inngest')
export class InngestController {
  constructor(private readonly inngestService: InngestService) {}

  @All('*')
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.inngestService.inngestHandler(req, res);
  }
}
