const plain_text = (text) => {
  return(
    {
      type: "section",
      text: {
          type: "plain_text",
          text: text
        }
    }
  )
}

const mrkdwn = (text) => {
  return(
    {
      type: "section",
      text: {
          type: "mrkdwn",
          text: text
        }
    }
  )
}

module.exports = { plain_text, mrkdwn}