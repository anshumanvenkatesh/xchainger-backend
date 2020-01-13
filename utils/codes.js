const codes = {
  2000: "Completed Successfully",
  3001: "User does not exist",
  3002: "User already exists",
  4001: "Subject does not exist. Please request support team to add this subject.",
  6001: "Institution mismatch",
}

module.exports = {
  all_ok: {
    "code": "2000",
    "msg": codes["2000"]
  },
  userNotExist: {
    code: "3001",
    msg: codes["3001"]
  },
  userAlreadyExist: {
    code: "3002",
    msg: codes["3002"]
  },
  subjectNotExist: {
    code: "4001",
    msg: codes["4001"]
  },
  institutionMismatch: {
    code: "6001",
    msg: codes["6001"]
  },
  
}