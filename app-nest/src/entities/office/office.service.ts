import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Office, OfficeRepository } from "./office.entity";

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office) private officeRepository: OfficeRepository,
  ) {}

  async findAll() {
    return this.officeRepository.find();
  }
}
