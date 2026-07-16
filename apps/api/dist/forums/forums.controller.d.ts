import { ForumsService } from './forums.service';
export declare class ForumsController {
    private readonly forumsService;
    constructor(forumsService: ForumsService);
    findAll(): {
        id: number;
        title: string;
        posts: number;
    }[];
    create(body: {
        title: string;
    }): {
        id: number;
        title: string;
        posts: number;
    };
}
