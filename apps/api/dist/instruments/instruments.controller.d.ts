import { InstrumentsService } from './instruments.service';
export declare class InstrumentsController {
    private readonly instrumentsService;
    constructor(instrumentsService: InstrumentsService);
    findAll(): {
        id: string;
        name: string;
        family: string;
    }[];
}
