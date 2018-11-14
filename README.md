Torte is a Web Frontend Firestore Wrapper library that can be used just like [starhoshi/tart](https://github.com/starhoshi/tart).

# Installation

```
npm install @star__hoshi/torte --save
yarn add @star__hoshi/torte
```

# Usage

## Initialize

```ts
import * as firebase from 'firebase'
import * as Torte from '@star__hoshi/torte'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
}
firebase.initializeApp(config)

const auth = firebase.auth()
const firestore = firebase.firestore()

// Torte expects timestampsInSnapshots to be 'true'
firestore.settings({ timestampsInSnapshots: true })

Torte.initialize(firestore)
```

Other Interfaces are just the same as tart.
