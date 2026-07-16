export declare class SheetsService {
    private readonly sheets;
    findAll(): {
        id: number;
        title: string;
        type: string;
        owner: string;
    }[];
    create(payload: {
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
