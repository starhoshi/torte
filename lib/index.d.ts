import * as firebase from 'firebase/app';
import 'firebase/firestore';
declare type Partial<T> = {
    [P in keyof T]?: T[P];
};
export declare const initialize: (_firestore: firebase.firestore.Firestore) => void;
export declare class Snapshot<T extends Timestamps> {
    ref: firebase.firestore.DocumentReference;
    data: T;
    constructor(ref: firebase.firestore.DocumentReference, data: T);
    constructor(queryDocumentSnapshot: firebase.firestore.QueryDocumentSnapshot);
    constructor(documentSnapshot: firebase.firestore.DocumentSnapshot);
    readonly firestoreURL: string | undefined;
    private setCreatedDate;
    refresh(): Promise<void>;
    save(): Promise<void>;
    saveWithBatch(batch: firebase.firestore.WriteBatch): void;
    saveReferenceCollection<S extends Timestamps>(collectionName: string, snapshot: Snapshot<S>): Promise<void>;
    saveReferenceCollectionWithBatch<S extends Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>): void;
    saveNestedCollection<S extends Timestamps>(collectionName: string, snapshot: Snapshot<S>): Promise<void>;
    saveNestedCollectionWithBatch<S extends Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>): void;
    fetchNestedCollections<S extends Timestamps>(collectionName: string): Promise<Snapshot<S>[]>;
    update(data: Partial<T>): Promise<void>;
    updateWithBatch(batch: firebase.firestore.WriteBatch, data: Partial<T>): void;
    delete(): Promise<void>;
    deleteWithBatch(batch: firebase.firestore.WriteBatch): void;
}
export interface Timestamps {
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const makeNotSavedSnapshot: <T extends Timestamps>(path: string, data: T, id?: string | undefined) => Snapshot<T>;
export declare const fetch: <T extends Timestamps>(pathOrDocumentReference: string | firebase.firestore.DocumentReference, id?: string | undefined) => Promise<Snapshot<T>>;
export {};
