const header = (text) => {
  return(
    {
      type: "header",
      text: {
          type: "plain_text",
          text: text
        }
    }
  )
}

module.exports = { header }