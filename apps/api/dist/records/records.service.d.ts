export declare class RecordsService {
    private readonly records;
    findAll(): {
        id: number;
        title: string;
        artist: string;
        date: string;
    }[];
    create(payload: {
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
