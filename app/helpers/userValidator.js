class UserValidator {

  isNameValid(name) {
    if (name.length < 3 || name.length > 20) return false
    return new RegExp("[a-zA-Z_0-9]*").test(name)
  }

  isEmailValid(email) {
    if (email.length > 254) return false
    return new RegExp("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$").test(email)
  }

  isPasswordValid(password) {
    if (password.length < 8 || password.length > 256) return false
    return new RegExp("[a-zA-Z0-9_$!%^*#/\()?]*").test(password)
  }

  isGenderValid(gender) {
    return (gender === "Male" || gender === "Female" || gender === "Other")
  }

  isBirthdayValid(birthday) {
    // dunno how to check for valid date
    // will do later
    return true
  }

  isUserDataValid(userData) {
    return (this.isNameValid(userData.firstName) && this.isNameValid(userData.lastName) &&
      this.isEmailValid(userData.email) && this.isPasswordValid(userData.password) &&
      this.isBirthdayValid(userData.birthday) && this.isGenderValid(userData.gender))
  }
}

module.exports = UserValidator;