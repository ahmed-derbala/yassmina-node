
//permissions

let permission = {
  code: String,
  actions: [String],
  url: String,
  allowed: Boolean
}

//application owner
const SUPER = {
  title: 'super',
  level: 790,
  max: 10,
  permissions: [permission]
}

//application administrator
const ADMIN = {
  title: 'admin',
  level: 690,
}

//client support
const SUPPORT = {
  title: 'support',
  level: 680,
}



const USER = {
  title: 'user',
  level: 490,
}

const roles = [SUPER.title, ADMIN.title, USER.title]



module.exports = {
  roles,
  SUPER, ADMIN, SUPPORT, USER
}