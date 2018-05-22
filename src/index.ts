import * as Tart from '@star__hoshi/tart'
import * as firebase from 'firebase'

let firestore: firebase.firestore.Firestore

export const initialize = (_firestore: firebase.firestore.Firestore) => {
  firestore = _firestore
}

export class Snapshot<T extends Tart.Timestamps> {
  ref: firebase.firestore.DocumentReference
  data: T

  constructor(ref: firebase.firestore.DocumentReference, data: T)
  constructor(queryDocumentSnapshot: firebase.firestore.QueryDocumentSnapshot)
  constructor(documentSnapshot: firebase.firestore.DocumentSnapshot)
  constructor(a: any, b?: any) {
    if (b === null || b === undefined) {
      this.ref = a.ref
      this.data = a.data() as T
    } else {
      this.ref = a
      this.data = b
    }
  }

  private setCreatedDate() {
    this.data.createdAt = new Date()
    this.data.updatedAt = new Date()
  }

  async refresh() {
    this.data = await fetch<T>(this.ref).then(s => s.data)
  }

  save() {
    this.setCreatedDate()
    return this.ref.set(this.data)
  }

  saveWithBatch(batch: firebase.firestore.WriteBatch) {
    this.setCreatedDate()
    batch.set(this.ref, this.data)
  }

  saveReferenceCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set({ createdAt: new Date(), updatedAt: new Date() })
  }

  saveReferenceCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, { createdAt: new Date(), updatedAt: new Date() })
  }

  saveNestedCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set(snapshot.data)
  }

  saveNestedCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, snapshot.data)
  }

  async fetchNestedCollections<S extends Tart.Timestamps>(collectionName: string) {
    const nc = await this.ref.collection(collectionName).get()
    const ncs = nc.docs.map(doc => {
      return new Snapshot<S>(doc)
    })
    return ncs
  }

  update(data: { [id: string]: any }) {
    data.updatedAt = new Date()
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    return this.ref.update(data)
  }

  updateWithBatch(batch: firebase.firestore.WriteBatch, data: { [id: string]: any }) {
    data.updatedAt = new Date()
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    batch.update(this.ref, data)
  }

  delete() {
    return this.ref.delete()
  }

  deleteWithBatch(batch: firebase.firestore.WriteBatch) {
    batch.delete(this.ref)
  }
}

export const makeNotSavedSnapshot = <T extends Tart.Timestamps>(path: string, data: T) => {
  const ref = firestore.collection(path).doc()
  return new Snapshot<T>(ref, data)
}

export const fetch = async <T extends Tart.Timestamps>(pathOrDocumentReference: string | firebase.firestore.DocumentReference, id?: string) => {
  let docPath: string = ''
  if (typeof pathOrDocumentReference === 'string') {
    docPath = `${pathOrDocumentReference}/${id}`
  } else {
    docPath = (pathOrDocumentReference as firebase.firestore.DocumentReference).path
  }

  const ds = await firestore.doc(docPath).get()
  if (!ds.exists) {
    throw Error(`${ds.ref.path} is not found.`)
  }
  return new Snapshot<T>(ds)
}
