//use it like req.body = deleteFromJson(req.body,['status','isdeleted'])
exports.deleteFromJson = (json, toDelete) => {
    for (let t = 0; t < toDelete.length; t++) {
        delete json[toDelete[t]]
    }
    return json
}

exports.keepFromJson = (json, toKeep) => {
    let keys = Object.keys(json);
    for (let t = 0; t < keys.length; t++) {
        if (!toKeep.includes(keys[t])) {
            delete json[keys[t]]
        }
    }
    return json
}