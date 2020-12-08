
# ***yassmina-node***
## IMPORTANT NOTES :

`Most of the requests needs to include a valid token on the header`  |
-|

`you can always check logs via 127.0.0.1:3000/log, if nothing is shown try to reset logs via 127.0.0.1:3000/resetLogs `  |
-|

### http status codes
| STATUS | MESSAGE                                                                                                |
|--------|--------------------------------------------------------------------------------------------------------|
| `200`  | success                                                                                                |
| `201`  | success and new entry created                                                                          |
| `204`  | success but response is empty                                                                          |
| `209`  | not updated, may because of new values equal to old values                                                   |
| `210`  | params sent are not valid comparing to data saved in DB but the server handled it |
| `401`  | token errors (missing, invalid, expired ..) you should try relogin before contacting backend developer |
| `403`  | you dont have permission, check the role                                                               |
| `404`  | the requested data was not found (never being created, destroyed or marked as deleted) |
| `422`  | request params or body are malformed, reload this doc for any changes of attributes names              |
| `423`  | wrong password              |
| `424`  | entry duplication               |
| `461`  | a unique constraint error                                                                              |
| `462`  | not allowed, check your allowed features                                                                              |
| `522`  | database fail, you should contact backend developer                                                    |
| `523`  | operation error, redoing the action with different parameters may succeed (it may be temporary error)  |
| `524`  | operation error but it can be overrided, headers.force=true required to override |



# ****run the project****
```
npm i
npm run jsdoc
nodemon | npm start
```

# ****documentation****

basically functions
```
http://127.0.0.1:3000/api/doc/jsdoc
```

# ****logs****
```
http://127.0.0.1:3000/log
```