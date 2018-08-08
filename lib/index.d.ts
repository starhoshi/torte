import * as Tart from '@star__hoshi/tart';
import * as firebase from 'firebase';
declare type Partial<T> = {
    [P in keyof T]?: T[P];
};
export declare const initialize: (_firestore: firebase.firestore.Firestore) => void;
export declare class Snapshot<T extends Tart.Timestamps> {
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
    saveReferenceCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>): Promise<void>;
    saveReferenceCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>): void;
    saveNestedCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>): Promise<void>;
    saveNestedCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>): void;
    fetchNestedCollections<S extends Tart.Timestamps>(collectionName: string): Promise<Snapshot<S>[]>;
    update(data: Partial<T>): Promise<void>;
    updateWithBatch(batch: firebase.firestore.WriteBatch, data: Partial<T>): void;
    delete(): Promise<void>;
    deleteWithBatch(batch: firebase.firestore.WriteBatch): void;
}
export declare const makeNotSavedSnapshot: <T extends Tart.Timestamps>(path: string, data: T, id?: string | undefined) => Snapshot<T>;
export declare const fetch: <T extends Tart.Timestamps>(pathOrDocumentReference: string | firebase.firestore.DocumentReference, id?: string | undefined) => Promise<Snapshot<T>>;
export {};
