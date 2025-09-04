import { All, Controller, Req, Res } from '@nestjs/common';
import { InngestService } from 'src/inngest/inngest.service';

@Controller('/api/inngest')
export class InngestController {
  constructor(private readonly inngestService: InngestService) {}

  @All()
  root(@Req() req: Request, @Res() res: Response) {
    return this.inngestService.inngestHandler(req, res);
  }

  // @All('*')
  // handle(@Req() req: Request, @Res() res: Response): Promise<void> {
  //   return this.inngestService.inngestHandler(req, res);
  // }
}
