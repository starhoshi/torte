import * as Tart from '@star__hoshi/tart'
import * as firebase from 'firebase'

type Partial<T> = { [P in keyof T]?: T[P]; }

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
      this.data = toOutput(a.data() as T)
    } else {
      this.ref = a
      this.data = b
    }
  }

  get firestoreURL(): string | undefined {
    const _firestore = this.ref.firestore as any
    if (_firestore && _firestore._databaseId && _firestore._databaseId.projectId) {
      return `https://console.firebase.google.com/project/${_firestore._databaseId.projectId}/database/firestore/data/${this.ref.path}`
    }
    return undefined
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
    return this.ref.set(toInput(this.data))
  }

  saveWithBatch(batch: firebase.firestore.WriteBatch) {
    this.setCreatedDate()
    batch.set(this.ref, toInput(this.data))
  }

  saveReferenceCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set(toInput({ createdAt: new Date(), updatedAt: new Date() }))
  }

  saveReferenceCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, toInput({ createdAt: new Date(), updatedAt: new Date() }))
  }

  saveNestedCollection<S extends Tart.Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set(toInput(snapshot.data))
  }

  saveNestedCollectionWithBatch<S extends Tart.Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, toInput(snapshot.data))
  }

  async fetchNestedCollections<S extends Tart.Timestamps>(collectionName: string) {
    const nc = await this.ref.collection(collectionName).get()
    const ncs = nc.docs.map(doc => {
      return new Snapshot<S>(doc)
    })
    return ncs
  }

  update(data: Partial<T>) {
    data.updatedAt = new Date()
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    return this.ref.update(toInput(data))
  }

  updateWithBatch(batch: firebase.firestore.WriteBatch, data: Partial<T>) {
    data.updatedAt = new Date()
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    batch.update(this.ref, toInput(data))
  }

  delete() {
    return this.ref.delete()
  }

  deleteWithBatch(batch: firebase.firestore.WriteBatch) {
    batch.delete(this.ref)
  }
}

export const makeNotSavedSnapshot = <T extends Tart.Timestamps>(path: string, data: T, id?: string) => {
  let ref = firestore.collection(path).doc()
  if (id) {
    ref = firestore.collection(path).doc(id)
  }
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

function toInput<T extends Tart.Timestamps>(data: T) {
  let result: any = {}
  for (let attr in data) {
    if (data[attr] instanceof Date) {
      if (!data[attr]) {
        continue
      }
      const date = data[attr] as any as Date
      result[attr] = firebase.firestore.Timestamp.fromDate(date)
    } else {
      result[attr] = data[attr]
    }
  }
  return result
}
function toOutput<T extends Tart.Timestamps>(data: T) {
  let result: any = {}
  for (let attr in data) {
    if (data[attr] instanceof firebase.firestore.Timestamp) {
      if (!data[attr]) {
        continue
      }
      const date = data[attr] as any as firebase.firestore.Timestamp
      result[attr] = date.toDate()
    } else {
      result[attr] = data[attr]
    }
  }
  return result
}