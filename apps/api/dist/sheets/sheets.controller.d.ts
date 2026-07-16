import { SheetsService } from './sheets.service';
export declare class SheetsController {
    private readonly sheetsService;
    constructor(sheetsService: SheetsService);
    findAll(): {
        id: number;
        title: string;
        type: string;
        owner: string;
    }[];
    create(body: {
        title: string;
        type: string;
        owner: string;
    }): {
        title: string;
        type: string;
        owner: string;
        id: number;
    };
}
