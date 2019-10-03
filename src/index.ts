import * as firebase from 'firebase/app'
import 'firebase/firestore'

type Partial<T> = { [P in keyof T]?: T[P]; }

let firestore: firebase.firestore.Firestore

export const initialize = (_firestore: firebase.firestore.Firestore) => {
  firestore = _firestore
}

export class Snapshot<T extends Timestamps> {
  ref: firebase.firestore.DocumentReference
  data: T

  constructor(ref: firebase.firestore.DocumentReference, data: T)
  constructor(queryDocumentSnapshot: firebase.firestore.QueryDocumentSnapshot)
  constructor(documentSnapshot: firebase.firestore.DocumentSnapshot)
  constructor(a: any, b?: any) {
    if (b === null || b === undefined) {
      this.ref = a.ref
      this.data = convertToOutput(a.data() as T)
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
    return this.ref.set(convertToInput(this.data))
  }

  saveWithBatch(batch: firebase.firestore.WriteBatch) {
    this.setCreatedDate()
    batch.set(this.ref, convertToInput(this.data))
  }

  saveReferenceCollection<S extends Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set(convertToInput({ createdAt: new Date(), updatedAt: new Date() }))
  }

  saveReferenceCollectionWithBatch<S extends Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, convertToInput({ createdAt: new Date(), updatedAt: new Date() }))
  }

  saveNestedCollection<S extends Timestamps>(collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    return rc.set(convertToInput(snapshot.data))
  }

  saveNestedCollectionWithBatch<S extends Timestamps>(batch: firebase.firestore.WriteBatch, collectionName: string, snapshot: Snapshot<S>) {
    const rc = this.ref.collection(collectionName).doc(snapshot.ref.id)
    batch.set(rc, convertToInput(snapshot.data))
  }

  async fetchNestedCollections<S extends Timestamps>(collectionName: string) {
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
    return this.ref.update(convertToInput(data))
  }

  updateWithBatch(batch: firebase.firestore.WriteBatch, data: Partial<T>) {
    data.updatedAt = new Date()
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    batch.update(this.ref, convertToInput(data))
  }

  delete() {
    return this.ref.delete()
  }

  deleteWithBatch(batch: firebase.firestore.WriteBatch) {
    batch.delete(this.ref)
  }
}

export interface Timestamps {
  createdAt?: Date
  updatedAt?: Date
}

export const makeNotSavedSnapshot = <T extends Timestamps>(path: string, data: T, id?: string) => {
  let ref = firestore.collection(path).doc()
  if (id) {
    ref = firestore.collection(path).doc(id)
  }
  return new Snapshot<T>(ref, data)
}

export const fetch = async <T extends Timestamps>(pathOrDocumentReference: string | firebase.firestore.DocumentReference, id?: string) => {
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

const convertToInput = <T extends Timestamps>(data: T) => {
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

const convertToOutput = <T extends Timestamps>(data: T) => {
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