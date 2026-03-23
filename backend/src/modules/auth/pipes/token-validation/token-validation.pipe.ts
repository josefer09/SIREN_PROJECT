import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TokenValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.length !== 6) {
      throw new BadRequestException('Token must be exactly 6 characters');
    }

    if (!/^[a-f0-9]{6}$/i.test(value)) {
      throw new BadRequestException('Token must be alphanumeric (hex)');
    }

    return value.toLowerCase();
  }
}
