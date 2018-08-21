module.exports = {
  delay: milliseconds => message => new Promise((resolve) => {
    setTimeout(resolve, milliseconds, message)
  }),
}
