# *API documentation*

## swagger: /api/doc/swagger

 under the path /docs/swaggerdir:
 * a collection is represented by a folder
 * a route is represented by a js file
 * this is the default to correctly send req.body

``` 
 "consumes": [
                "application/json"
            ],
```

 * dont forget to add a code to operationId which is basically the API short name like login or register                        

``` 
"operationId": "a code",
```

 ## jsdoc: /api/doc/jsdoc
 * refresh jsdoc directory: /api/doc/jsdoc/refresh
