import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;
}
