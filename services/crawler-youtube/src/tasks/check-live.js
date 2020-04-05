const {Firestore} = require('@google-cloud/firestore');

module.exports = function() {
  (async function(){
    console.log('checkLive() START')
    let result = {}

    const firestore = new Firestore({ keyFilename: 'gcp-key.json' })

    // GET
    // const foobarRef = firestore.doc('test/foobar')
    // const foobarData = await foobarRef.get()
    // console.log('foobarData.exists', foobarData.exists)
    // console.log('foobarData', foobarData.data()))

    // UPDATE
    // const foobarRef = firestore.doc('test/foobar')
    // let foobarUp = await foobarRef.update({ b: 2 })
    // console.log('foobarUp', foobarUp)

    // CREATE
    // const foobarRef = firestore.doc('test/helloworld')
    // const foobarAdd = await foobarRef.create({ a: 3, b: 4 })
    // console.log('foobarAdd', foobarAdd)
    
    // FETCH
    // const testCol = firestore.collection('test')
    // const testList = await testCol.where('b', '==', 4).get()
    // testList.forEach(foobarData => {
    //   console.log('foobarData', foobarData.ref.parent.id, foobarData.id, foobarData.data())
    // })

    // DELETE
    // const foobarRef = firestore.doc('test/helloworld')
    // let foobarDel = await foobarRef.delete()
    // console.log('foobarDel', foobarDel)
    
    console.log('checkLive() SUCCESS', result)
  })()
  .catch(err => {
    console.log('checkLive() ERROR', err)
  })
}