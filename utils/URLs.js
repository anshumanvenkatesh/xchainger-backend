const CHECKINIT = `match (i:Config {type:"init", status:"true"}) return i;`
const ADDUNIQCONSTRAINT_USER = `CREATE CONSTRAINT ON (u:User) ASSERT u.UID IS UNIQUE;`
const ADDUNIQCONSTRAINT_SUBJECT = `CREATE CONSTRAINT ON (s:Subject) ASSERT s.SID IS UNIQUE;`
const ADDCONFIGNODE = `create (i:Config {type:"init", status:"true"});`

module.exports = {
  CHECKINIT,
  ADDUNIQCONSTRAINT_USER,
  ADDUNIQCONSTRAINT_SUBJECT,
  ADDCONFIGNODE
}