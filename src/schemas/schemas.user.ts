export interface UserInterface extends Document {
    username: string;
    email: string;
    password: string;
    verified:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}