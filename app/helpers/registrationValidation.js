module.exports = {

  isNameValid: (name) => {
    if (name.length < 3 || name.length > 20) return false
    return new RegExp("[a-zA-Z_0-9]*").test(name)
  },

  isEmailValid: (email) => {
    if (email.length > 254) return false
    return new RegExp("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$").test(email)
  },

  isPasswordValid: (password) => {
    if (password.length < 8 || password.length > 25) return false
    return new RegExp("[a-zA-Z0-9_$!%^*#/\()?]*").test(password)
  },

  isGenderValid: (gender) => {
    return (gender === "Male" || gender === "Female" || gender === "Other")
  },

  isBirthdayValid: (birthday) => {
    // dunno how to check for valid date
    // will do later
    return true
  },

  isRegistrationValid: (registrationData) => {
    console.log(module.exports.isNameValid(registrationData.firstName) , module.exports.isNameValid(registrationData.lastName) ,
      module.exports.isEmailValid(registrationData.email) , module.exports.isPasswordValid(registrationData.password) ,
      module.exports.isBirthdayValid(registrationData.birthday) , module.exports.isGenderValid(registrationData.gender))

    return (module.exports.isNameValid(registrationData.firstName) && module.exports.isNameValid(registrationData.lastName) &&
      module.exports.isEmailValid(registrationData.email) && module.exports.isPasswordValid(registrationData.password) &&
      module.exports.isBirthdayValid(registrationData.birthday) && module.exports.isGenderValid(registrationData.gender))
  }
}