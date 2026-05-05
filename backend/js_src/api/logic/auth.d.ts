export type User = {
    id: number;
    username: string;
    passwordHash: string;
};
export declare function createUser(username: string, password: string): Promise<User>;
export declare function findUserByUsername(username: string): Promise<User | null>;
export declare function findUserById(id: number): Promise<User | null>;
