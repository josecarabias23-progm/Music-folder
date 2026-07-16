export declare class ForumsService {
    private readonly threads;
    findAll(): {
        id: number;
        title: string;
        posts: number;
    }[];
    create(payload: {
        title: string;
    }): {
        id: number;
        title: string;
        posts: number;
    };
}
