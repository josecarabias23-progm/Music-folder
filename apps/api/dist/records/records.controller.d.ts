import { RecordsService } from './records.service';
export declare class RecordsController {
    private readonly recordsService;
    constructor(recordsService: RecordsService);
    findAll(): {
        id: number;
        title: string;
        artist: string;
        date: string;
    }[];
    create(body: {
        title: string;
        artist: string;
        date: string;
    }): {
        title: string;
        artist: string;
        date: string;
        id: number;
    };
}
