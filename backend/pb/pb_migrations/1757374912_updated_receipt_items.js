/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3971112972")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = owner"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3971112972")

  // update collection data
  unmarshal({
    "createRule": null
  }, collection)

  return app.save(collection)
})
