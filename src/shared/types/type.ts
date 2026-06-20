export type Timestamps = {
    createdAt: Date;
    updatedAt: Date;
};

export type GeneralResponse<T> = {
    success: boolean;
    data: T;
}
