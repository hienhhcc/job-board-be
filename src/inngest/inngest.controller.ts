import { All, Controller, Req, Res } from '@nestjs/common';
import { inngestHandler } from 'services/inngest';

@Controller('/api/inngest')
export class InngestController {
  @All()
  handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    return inngestHandler(req, res);
  }
}
